import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, RefreshControl, Linking
} from 'react-native';
import {
  getActiveContracts, getRoomById,
  leaveRoom, createPayment, cancelContract, simulatePayment,
  getBillsByContractId
} from '../../services/api';

interface Contract {
  contract_id: number;
  room_id: number;
  start_date: string;
  end_date: string | null;
  status: string;
}

interface Bill {
  bill_id: number;
  contract_id: number;
  bill_month: string;
  total_amount: number;
  rent_amount: number;
  electricity_amount: number;
  water_amount: number;
  service_amount: number;
  payment_status: 'Paid' | 'Unpaid';
  payment_date: string | null;
}

interface Room {
  room_id: number;
  room_number: string;
  property_address: string;
  image_url: string;
}

export default function RentedRoomsScreen() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [roomsMap, setRoomsMap] = useState<Record<number, Room>>({});
  const [billsMap, setBillsMap] = useState<Record<number, Bill[]>>({});
  const [expandedRooms, setExpandedRooms] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState<number | null>(null);

  const reloadData = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const contractData = await getActiveContracts();
      setContracts(contractData || []);

      const roomIds = [...new Set(contractData.map((c:any) => c.room_id))];
      const rooms = await Promise.all(roomIds.map((id:any) => getRoomById(id.toString())));
      const roomMap: Record<number, Room> = {};
      rooms.forEach(r => { if (r) roomMap[r.room_id] = r; });
      setRoomsMap(roomMap);

      const billMap: Record<number, Bill[]> = {};
      for (const contract of contractData) {
        const bills = await getBillsByContractId(contract.contract_id);
        billMap[contract.contract_id] = bills;
      }
      setBillsMap(billMap);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.error || err.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  const toggleExpand = (roomId: number) => {
    setExpandedRooms(prev => ({ ...prev, [roomId]: !prev[roomId] }));
  };

  const canLeaveRoom = (roomContracts: Contract[]): boolean => {
    return roomContracts.every(contract => {
      const bills = billsMap[contract.contract_id] || [];
      return bills.length > 0 && bills.every(b => b.payment_status === 'Paid');
    });
  };

  const handleLeave = async (roomContracts: Contract[], roomId: number) => {
    const unpaid = roomContracts.find(c => {
      const bills = billsMap[c.contract_id] || [];
      return bills.some(b => b.payment_status !== 'Paid');
    });
    if (unpaid) {
      return Alert.alert('Thông báo', 'Phải thanh toán toàn bộ hóa đơn trước khi trả phòng.');
    }

    const targetContract = roomContracts[0];
    Alert.alert('Xác nhận', `Trả phòng ${roomsMap[roomId]?.room_number}?`, [
      { text: 'Huỷ' },
      {
        text: 'Đồng ý',
        onPress: async () => {
          try {
            setProcessing(targetContract.contract_id);
            await leaveRoom(targetContract.contract_id.toString());
            setContracts(prev => prev.filter(c => c.contract_id !== targetContract.contract_id));
            Alert.alert('Thành công', 'Đã trả phòng.');
          } catch (err: any) {
            Alert.alert('Lỗi', err?.response?.data?.error || err.message);
          } finally {
            setProcessing(null);
          }
        }
      }
    ]);
  };

  const handlePayment = async (contractId: number, bill: Bill, room: Room) => {
    try {
      const paymentData = await createPayment(
        Math.floor(bill.total_amount),
        `${bill.bill_id}-${Date.now()}`,
        `Thanh toán hóa đơn phòng ${room.room_number}`,
        'https://mms-mobile-success.com/my-room'
      );
      if (paymentData?.payUrl) {
        Linking.openURL(paymentData.payUrl);
      } else {
        Alert.alert('Lỗi', 'Không tạo được URL thanh toán.');
      }
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.error || err.message);
    }
  };

  const handleSimulatePayment = async (contractId: number, billId: number) => {
    try {
      setProcessing(billId);
      await simulatePayment(contractId);
      await reloadData();
      Alert.alert('Thành công', 'Giả lập thanh toán thành công.');
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.error || err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleCancelContract = async (contract: Contract) => {
    const start = new Date(contract.start_date);
    const today = new Date();
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diff = (today.getTime() - start.getTime()) / (1000 * 3600 * 24);
    if (diff < 0 || diff > 3) {
      return Alert.alert('Không thể huỷ', 'Chỉ được huỷ trong vòng 3 ngày đầu.');
    }

    Alert.alert('Xác nhận huỷ', 'Bạn chắc chắn muốn huỷ hợp đồng này?', [
      { text: 'Không' },
      {
        text: 'Đồng ý',
        onPress: async () => {
          try {
            setProcessing(contract.contract_id);
            await cancelContract(contract.contract_id.toString());
            setContracts(prev => prev.filter(c => c.contract_id !== contract.contract_id));
            Alert.alert('Thành công', 'Đã huỷ hợp đồng');
          } catch (err: any) {
            Alert.alert('Lỗi', err?.response?.data?.error || err.message);
          } finally {
            setProcessing(null);
          }
        }
      }
    ]);
  };

  const groupedContracts = contracts.reduce((acc, c) => {
    if (!acc[c.room_id]) acc[c.room_id] = [];
    acc[c.room_id].push(c);
    return acc;
  }, {} as Record<number, Contract[]>);

  if (loading && !refreshing) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!contracts.length) return <Text style={styles.noRoom}>Bạn chưa thuê phòng nào.</Text>;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} />}
    >
      <Text style={styles.heading}>Danh sách phòng đã thuê</Text>
      {Object.entries(groupedContracts).map(([roomIdStr, roomContracts]) => {
        const roomId = parseInt(roomIdStr);
        const room = roomsMap[roomId];
        const expanded = expandedRooms[roomId] || false;

        return (
          <View key={roomId} style={styles.card}>
            <TouchableOpacity onPress={() => toggleExpand(roomId)} style={styles.header}>
              <Image source={{ uri: `https://ho-ng-b-i-1.paiza-user-free.cloud:5000${room?.image_url}` }} style={styles.image} />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Phòng {room?.room_number}</Text>
                <Text>{room?.property_address}</Text>
              </View>
              <TouchableOpacity
                disabled={!canLeaveRoom(roomContracts)}
                onPress={() => handleLeave(roomContracts, roomId)}
                style={[styles.btnLeave, { backgroundColor: canLeaveRoom(roomContracts) ? '#e74c3c' : '#ccc' }]}
              >
                <Text style={styles.btnText}>
                  {processing && roomContracts.some(c => c.contract_id === processing) ? 'Đang xử lý...' : 'Trả phòng'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {expanded && (
              <View style={styles.contractBox}>
                {roomContracts.map(c => {
                  const bills = billsMap[c.contract_id] || [];
                  return bills.map(bill => (
                    <View key={bill.bill_id} style={styles.contractItem}>
                      <Text>Mã hóa đơn: {bill.bill_id}</Text>
                      <Text>Tháng: {new Date(bill.bill_month).toLocaleDateString('vi-VN')}</Text>
                      <Text>Trạng thái: <Text style={{ color: bill.payment_status === 'Paid' ? 'green' : 'red' }}>{bill.payment_status}</Text></Text>
                      <Text>Tiền phòng: {bill.rent_amount.toLocaleString('vi-VN')} VNĐ</Text>
                      <Text>Tiền điện: {bill.electricity_amount.toLocaleString('vi-VN')} VNĐ</Text>
                      <Text>Tiền nước: {bill.water_amount.toLocaleString('vi-VN')} VNĐ</Text>
                      <Text>Tiền dịch vụ: {bill.service_amount.toLocaleString('vi-VN')} VNĐ</Text>
                      <Text style={{ fontWeight: 'bold' }}>Tổng: {bill.total_amount.toLocaleString('vi-VN')} VNĐ</Text>

                      {bill.payment_status === 'Unpaid' && (
                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                          <TouchableOpacity style={[styles.btnPay, { flex: 1 }]} onPress={() => handlePayment(c.contract_id, bill, room)}>
                            <Text style={styles.btnText}>Thanh toán</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.btnPay, { flex: 1, backgroundColor: '#6c5ce7' }]}
                            onPress={() => handleSimulatePayment(c.contract_id, bill.bill_id)}
                            disabled={processing === bill.bill_id}
                          >
                            <Text style={styles.btnText}>{processing === bill.bill_id ? '...' : 'Giả lập'}</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={[styles.btnCancel, { flex: 1, backgroundColor: '#f39c12' }]}
                            onPress={() => handleCancelContract(c)}>
                            <Text style={styles.btnText}>Huỷ hợp đồng</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ));
                })}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: '#fff', marginBottom: 16, borderRadius: 10, overflow: 'hidden', elevation: 2 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  btnLeave: { padding: 8, borderRadius: 6 },
  btnPay: { padding: 8, backgroundColor: '#3498db', borderRadius: 6 },
  btnCancel: { padding: 8, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  contractBox: { padding: 10, backgroundColor: '#f9f9f9', borderTopWidth: 1, borderColor: '#ddd' },
  contractItem: { marginBottom: 12, padding: 10, backgroundColor: '#fff', borderRadius: 8, elevation: 1 },
  noRoom: { textAlign: 'center', marginTop: 40, color: '#777' },
});
