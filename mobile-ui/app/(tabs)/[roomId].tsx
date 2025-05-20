// app/room/[roomId].tsx - Chi tiết phòng dành cho Renter
import { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, Image, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { getRoomById, rentRoom } from '../../services/api';

type Room = {
  room_id: number;
  room_number: string;
  property_address: string;
  room_type_name: string;
  rent_price: number;
  image_url: string;
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
    <View style={styles.container}>
      <Text style={styles.heading}>Chi tiết phòng</Text>
      <Image source={{ uri: `https://ho-ng-b-i-1.paiza-user-free.cloud:5000${room.image_url}` }} style={styles.image} />
      <Text style={styles.label}>Số phòng: <Text style={styles.value}>{room.room_number}</Text></Text>
      <Text style={styles.label}>Địa chỉ: <Text style={styles.value}>{room.property_address}</Text></Text>
      <Text style={styles.label}>Loại phòng: <Text style={styles.value}>{room.room_type_name}</Text></Text>
      <Text style={styles.label}>Giá thuê: <Text style={styles.price}>{room.rent_price.toLocaleString()} VNĐ/tháng</Text></Text>

      {!isRented ? (
        <Button title="Thuê phòng này" onPress={handleRent} color="#007bff" />
      ) : (
        <Text style={styles.rentedMsg}>Bạn đang thuê phòng này.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  image: { width: '100%', height: 200, resizeMode: 'cover', borderRadius: 10, marginBottom: 15 },
  label: { fontSize: 16, marginBottom: 6, color: '#333' },
  value: { fontWeight: '600' },
  price: { fontWeight: 'bold', color: '#27ae60' },
  error: { color: 'red', textAlign: 'center', marginTop: 20 },
  rentedMsg: { marginTop: 20, textAlign: 'center', fontWeight: '600', color: '#28a745' },
});