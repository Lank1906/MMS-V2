// app/index.tsx - Dashboard cho Renter (danh sách phòng trống)
import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getAvailableRooms } from '../../services/api';
import { router } from 'expo-router';

type Room = {
  room_id: number;
  room_number: string;
  property_address: string;
  room_type_name: string;
  rent_price: number;
  image_url: string;
};

type Filters = {
  address: string;
  minPrice: string;
  maxPrice: string;
};

export default function DashboardScreen() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filters, setFilters] = useState<Filters>({ address: '', minPrice: '', maxPrice: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = {
        address: filters.address,
        minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
        page: 1,
        limit: 20,
      };
      const data = await getAvailableRooms(params);
      setRooms(data.rooms || []);
    } catch (err) {
      setError('Không thể tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    fetchRooms();
  };

  const renderRoom = ({ item }: { item: Room }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/${item.room_id}`)}>
      <Image source={{ uri: `https://ho-ng-b-i-1.paiza-user-free.cloud:5000${item.image_url}` }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>Phòng {item.room_number}</Text>
        <Text>📍 {item.property_address}</Text>
        <Text>🏷️ {item.room_type_name}</Text>
        <Text style={styles.price}>{item.rent_price.toLocaleString()} VNĐ/tháng</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Khám phá phòng trống đẹp - Giá hợp lý</Text>
      <View style={styles.filterRow}>
        <TextInput
          placeholder="Địa chỉ"
          style={styles.input}
          value={filters.address}
          onChangeText={(text) => handleChange('address', text)}
        />
        <TextInput
          placeholder="Giá từ"
          style={styles.input}
          keyboardType="numeric"
          value={filters.minPrice}
          onChangeText={(text) => handleChange('minPrice', text)}
        />
        <TextInput
          placeholder="Giá đến"
          style={styles.input}
          keyboardType="numeric"
          value={filters.maxPrice}
          onChangeText={(text) => handleChange('maxPrice', text)}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Text style={{ color: 'white' }}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={rooms}
        renderItem={renderRoom}
        keyExtractor={(item) => item.room_id.toString()}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    flexGrow: 1,
    minWidth: '30%',
  },
  searchButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 5,
  },
  card: {
    backgroundColor: 'white',
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  image: { width: '100%', height: 180, resizeMode: 'cover' },
  info: { padding: 10 },
  title: { fontSize: 18, fontWeight: 'bold' },
  price: { marginTop: 5, fontWeight: 'bold', color: '#27ae60' },
  error: { color: 'red', textAlign: 'center', marginVertical: 10 },
});