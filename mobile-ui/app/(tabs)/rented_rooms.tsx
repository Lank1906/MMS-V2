// app/rented_rooms.tsx
import { JSX, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Linking } from 'react-native';
import { getActiveContracts, getRoomById, leaveRoom, createPayment } from '../../services/api';

interface Contract {
  contract_id: number;
  room_id: number;
  start_date: string;
  end_date: string | null;
  status: string;
  payment_status: 'Paid' | 'Unpaid';
  rent_price: number;
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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
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
      }
    };
    loadData();
  }, []);

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
            await leaveRoom(contract.contract_id.toString());
            setContracts(prev => prev.filter(c => c.contract_id !== contract.contract_id));
            Alert.alert('Thành công', 'Đã trả phòng');
          } catch {
            Alert.alert('Lỗi', 'Không thể trả phòng');
          }
        }
      }
    ]);
  };

  const handlePayment = async (contract: Contract, room: Room): Promise<void> => {
    try {
      const paymentData = await createPayment(
        50000,
        contract.contract_id.toString(),
        `Thanh toán hợp đồng phòng ${room.room_number}`,
        '', '' // redirectUrl, ipnUrl nếu có
      );
      if (paymentData?.payUrl) {
        Linking.openURL(paymentData.payUrl)
      } else {
        Alert.alert('Lỗi', 'Không nhận được URL thanh toán');
      }
    } catch {
      Alert.alert('Lỗi', 'Không thể tạo thanh toán');
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!contracts.length) return <Text style={styles.noRoom}>Bạn chưa thuê phòng nào.</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Danh sách phòng đã thuê</Text>
      {contracts.map((contract: Contract) => {
        const room = roomsMap[contract.room_id];
        return (
          <View key={contract.contract_id} style={styles.card}>
            <Image source={{ uri: `https://ho-ng-b-i-1.paiza-user-free.cloud:5000${room?.image_url}` }} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.title}>Phòng {room?.room_number}</Text>
              <Text>{room?.property_address}</Text>
              <Text>Thời gian: {contract.start_date} - {contract.end_date || '-'}</Text>
              <Text>Giá thuê: {contract.rent_price.toLocaleString()} VNĐ</Text>
              <Text>Trạng thái: {contract.status}</Text>
              <Text>Thanh toán: {contract.payment_status}</Text>
              <View style={styles.buttonRow}>
                {contract.payment_status === 'Unpaid' && (
                  <TouchableOpacity style={styles.btnPay} onPress={() => handlePayment(contract, room)}>
                    <Text style={styles.btnText}>Thanh toán</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.btnLeave} onPress={() => handleLeave(contract)}>
                  <Text style={styles.btnText}>Trả phòng</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  image: { width: '100%', height: 160, resizeMode: 'cover' },
  info: { padding: 12 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  btnPay: { backgroundColor: '#3498db', padding: 10, borderRadius: 6 },
  btnLeave: { backgroundColor: '#e74c3c', padding: 10, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  noRoom: { textAlign: 'center', marginTop: 40, color: '#777' },
});
