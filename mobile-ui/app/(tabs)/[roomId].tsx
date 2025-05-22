import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { getRoomById, rentRoom } from '../../services/api';

type Room = {
  room_id: number;
  room_number: string;
  property_address: string;
  room_type_name: string;
  rent_price: number;
  electricity_price: string;
  water_price: string;
  max_occupants: number;
  description: string;
  status: string;
  image_url: string | null;
};

export default function RoomDetailScreen() {
  const { roomId } = useLocalSearchParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRented, setIsRented] = useState(false);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        setLoading(true);
        const data = await getRoomById(roomId as string);
        setRoom(data);
      } catch {
        setError('Lấy thông tin phòng thất bại.');
      } finally {
        setLoading(false);
      }
    };
    if (roomId) loadRoom();
  }, [roomId]);

  const handleRent = async () => {
    if (!room) return;
    try {
      await rentRoom({ room_id: room.room_id, rent_price: room.rent_price });
      Alert.alert('Thành công', 'Bạn đã thuê phòng thành công!');
      setIsRented(true);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.response?.data?.error || 'Thuê phòng thất bại');
    }
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!room) return <Text style={styles.error}>Không tìm thấy phòng.</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Chi tiết phòng</Text>

      <Image
        source={{
          uri: room.image_url
            ? `https://ho-ng-b-i-1.paiza-user-free.cloud:5000${room.image_url}`
            : 'https://via.placeholder.com/500x300?text=No+Image',
        }}
        style={styles.image}
      />

      <View style={styles.detailBox}>
        <Text style={styles.label}>Số phòng: <Text style={styles.value}>{room.room_number}</Text></Text>
        <Text style={styles.label}>Địa chỉ: <Text style={styles.value}>{room.property_address}</Text></Text>
        <Text style={styles.label}>Loại phòng: <Text style={styles.value}>{room.room_type_name}</Text></Text>
        <Text style={styles.label}>Sức chứa tối đa: <Text style={styles.value}>{room.max_occupants} người</Text></Text>
        <Text style={styles.label}>Giá thuê: <Text style={styles.price}>{Number(room.rent_price).toLocaleString('vi-VN')} VNĐ/tháng</Text></Text>
        <Text style={styles.label}>Giá điện: <Text style={styles.value}>{Number(room.electricity_price).toLocaleString('vi-VN')} VNĐ/kWh</Text></Text>
        <Text style={styles.label}>Giá nước: <Text style={styles.value}>{Number(room.water_price).toLocaleString('vi-VN')} VNĐ/m³</Text></Text>
        <Text style={styles.label}>Trạng thái:
          <Text style={[styles.value, { color: room.status === 'Available' ? '#27ae60' : '#e67e22' }]}>
            {' '}
            {room.status === 'Available' ? 'Còn trống' : room.status === 'Rented' ? 'Đã thuê' : 'Đang bảo trì'}
          </Text>
        </Text>
        <Text style={styles.label}>Mô tả:</Text>
        <Text style={styles.value}>{room.description || 'Không có mô tả.'}</Text>
      </View>

      {!isRented && room.status === 'Available' ? (
        <TouchableOpacity style={styles.rentBtn} onPress={handleRent}>
          <Text style={styles.rentBtnText}>Thuê phòng này</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.rentedMsg}>Bạn đang thuê phòng này.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7f7f7',
    flexGrow: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#222',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#eaeaea',
  },
  detailBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#444',
    marginBottom: 6,
  },
  value: {
    fontWeight: '600',
    color: '#000',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginTop: 6,
    marginBottom: 10,
  },
  rentBtn: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 40,
  },
  rentBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rentedMsg: {
    textAlign: 'center',
    color: '#28a745',
    fontWeight: '600',
    fontSize: 16,
    marginTop: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});
