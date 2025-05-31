import { JSX, useEffect, useState, useCallback } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, RefreshControl, Linking
} from 'react-native';
import {
  getActiveContracts, getRoomById,
  leaveRoom, createPayment, cancelContract
} from '../../services/api';

interface Contract {
  contract_id: number;
  room_id: number;
  start_date: string;
  end_date: string | null;
  status: string;
  payment_status: 'Paid' | 'Unpaid';
  rent_price: string;
  total_electricity_price: string;
  total_water_price: string;
  total_service_price: string;
}

interface Room {
  room_id: number;
  room_number: string;
  property_address: string;
  image_url: string;
}

export default function RentedRoomsScreen(): JSX.Element {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [roomsMap, setRoomsMap] = useState<Record<number, Room>>({});
  const [expandedRooms, setExpandedRooms] = useState<{ [roomId: number]: boolean }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [processingContractId, setProcessingContractId] = useState<number | null>(null);

  const canCancelContract = (startDateStr: string): boolean => {
    const startDate = new Date(startDateStr);
    const today = new Date();

    // Đặt thời gian 0 giờ 0 phút 0 giây để so sánh chỉ dựa trên ngày
    startDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Tính số ngày cách nhau
    const diffTime =- startDate.getTime() + today.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    // Nếu còn ít nhất 3 ngày mới đến ngày bắt đầu => cho phép huỷ
    return diffDays < 3;
  };

  const reloadContracts = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      const dataContracts: Contract[] = await getActiveContracts();
      setContracts(dataContracts || []);
      const uniqueRoomIds = [...new Set(dataContracts.map(c => c.room_id))];
      const rooms = await Promise.all(uniqueRoomIds.map(id => getRoomById(id.toString())));
      const map: Record<number, Room> = {};
      rooms.forEach((r: Room) => { if (r) map[r.room_id] = r; });
      setRoomsMap(map);
    } catch {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    reloadContracts();
  }, [reloadContracts]);

  const toggleExpand = (roomId: number) => {
    setExpandedRooms(prev => ({ ...prev, [roomId]: !prev[roomId] }));
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const isProcessing = (contract: Contract) => processingContractId === contract.contract_id;

  const getTotalAmount = (c: Contract) =>
    parseFloat(c.rent_price) +
    parseFloat(c.total_electricity_price) +
    parseFloat(c.total_water_price) +
    parseFloat(c.total_service_price);

  const handleLeave = async (contract: Contract): Promise<void> => {
    if (contract.payment_status !== 'Paid') {
      Alert.alert('Thông báo', 'Phải thanh toán hợp đồng trước khi trả phòng');
      return;
    }
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn trả phòng?', [
      { text: 'Hủy' },
      {
        text: 'Đồng ý', onPress: async () => {
          try {
            setProcessingContractId(contract.contract_id);
            await leaveRoom(contract.contract_id.toString());
            setContracts(prev => prev.filter(c => c.contract_id !== contract.contract_id));
            Alert.alert('Thành công', 'Đã trả phòng');
          } catch {
            Alert.alert('Lỗi', 'Không thể trả phòng');
          } finally {
            setProcessingContractId(null);
          }
        }
      }
    ]);
  };

  const handlePayment = async (contract: Contract, room: Room): Promise<void> => {
    if (!contract.end_date) {
      Alert.alert('Thông báo', 'Chủ thuê chưa cập nhật số điện của bạn vui lòng chờ đợi!');
      return
    }
    try {
      const paymentData = await createPayment(
        Math.floor(getTotalAmount(contract)),
        contract.contract_id.toString(),
        `Thanh toán hợp đồng phòng ${room.room_number}`,
        'http://localhost:3000/my-room' // redirectLink chỉ dành cho web nếu cần
      );
      if (paymentData?.payUrl) {
        Linking.openURL(paymentData.payUrl);
      } else {
        Alert.alert('Lỗi', 'Không nhận được URL thanh toán');
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể tạo thanh toán');
    }
  };

  const handleCancelContract = async (contract: Contract): Promise<void> => {
    if (!canCancelContract(contract.start_date)) {
      Alert.alert('Không thể huỷ', 'Chỉ được huỷ hợp đồng trước 3 ngày kể từ ngày bắt đầu.');
      return;
    }

    Alert.alert('Xác nhận huỷ', 'Bạn chắc chắn muốn huỷ hợp đồng này?', [
      { text: 'Không' },
      {
        text: 'Đồng ý',
        onPress: async () => {
          try {
            setProcessingContractId(contract.contract_id);
            await cancelContract(contract.contract_id.toString());
            setContracts(prev => prev.filter(c => c.contract_id !== contract.contract_id));
            Alert.alert('Thành công', 'Hợp đồng đã được huỷ');
          } catch {
            Alert.alert('Lỗi', 'Không thể huỷ hợp đồng');
          } finally {
            setProcessingContractId(null);
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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} />
      }
    >
      <Text style={styles.heading}>Danh sách phòng đã thuê</Text>
      {Object.entries(groupedContracts).map(([roomIdStr, roomContracts]) => {
        const roomId = parseInt(roomIdStr);
        const room = roomsMap[roomId];
        const expanded = expandedRooms[roomId] || false;
        const paidContract = roomContracts.find(c => c.payment_status === 'Paid');

        return (
          <View key={roomId} style={styles.card}>
            <TouchableOpacity onPress={() => toggleExpand(roomId)} style={styles.header}>
              <Image source={{ uri: `https://ho-ng-b-i-1.paiza-user-free.cloud:5000${room?.image_url}` }} style={styles.image} />
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Phòng {room?.room_number}</Text>
                <Text>{room?.property_address}</Text>
              </View>
              <TouchableOpacity
                disabled={!paidContract}
                style={[styles.btnLeave, { backgroundColor: paidContract ? '#e74c3c' : '#ccc' }]}
                onPress={() => paidContract && handleLeave(paidContract)}
              >
                <Text style={styles.btnText}>
                  {paidContract && isProcessing(paidContract) ? 'Đang xử lý...' : 'Trả phòng'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {expanded && (
              <View style={styles.contractBox}>
                {roomContracts.map(c => (
                  <View key={c.contract_id} style={styles.contractItem}>
                    <Text>Mã hợp đồng: {c.contract_id}</Text>
                    <Text>Thời gian: {formatDate(c.start_date)} - {c.end_date ? formatDate(c.end_date) : '-'}</Text>
                    <Text>Trạng thái: {c.status}</Text>
                    <Text>Thanh toán: <Text style={{ color: c.payment_status === 'Paid' ? 'green' : 'red' }}>{c.payment_status}</Text></Text>
                    <Text>Tiền phòng: {parseFloat(c.rent_price).toLocaleString('vi-VN')} VNĐ</Text>
                    <Text>Tiền điện: {parseFloat(c.total_electricity_price).toLocaleString('vi-VN')} VNĐ</Text>
                    <Text>Tiền nước: {parseFloat(c.total_water_price).toLocaleString('vi-VN')} VNĐ</Text>
                    <Text>Tiền dịch vụ: {parseFloat(c.total_service_price).toLocaleString('vi-VN')} VNĐ</Text>
                    <Text style={{ fontWeight: 'bold', marginTop: 4 }}>
                      Tổng tiền: {getTotalAmount(c).toLocaleString('vi-VN')} VNĐ
                    </Text>
                    {c.payment_status === 'Unpaid' && (
                      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                        <TouchableOpacity style={[styles.btnPay, { flex: 1 }]} onPress={() => handlePayment(c, room)}>
                          <Text style={styles.btnText}>Thanh toán</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.btnCancel, { flex: 1, backgroundColor: canCancelContract(c.start_date) ? '#e67e22' : '#ccc' }]}
                          disabled={!canCancelContract(c.start_date)}
                          onPress={() => handleCancelContract(c)}
                        >
                          <Text style={styles.btnText}>Huỷ hợp đồng</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
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
  btnPay: { marginTop: 8, backgroundColor: '#3498db', padding: 8, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  contractBox: { padding: 10, backgroundColor: '#f9f9f9', borderTopWidth: 1, borderColor: '#ddd' },
  contractItem: { marginBottom: 12, padding: 10, backgroundColor: '#fff', borderRadius: 8, elevation: 1 },
  noRoom: { textAlign: 'center', marginTop: 40, color: '#777' },
  btnCancel: { marginTop: 8, padding: 8, borderRadius: 6 },
});
