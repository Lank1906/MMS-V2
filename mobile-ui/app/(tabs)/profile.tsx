// app/profile.tsx
import { JSX, useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { getProfile, updateProfile, logout } from '../../services/api';
import { router } from 'expo-router';

interface Profile {
  username: string;
  email: string;
  phone: string;
  address: string;
}

export default function ProfileScreen(): JSX.Element {
  const [form, setForm] = useState<Profile>({ username: '', email: '', phone: '', address: '' });
  const [loading, setLoading] = useState<boolean>(true);
  const [isModified, setIsModified] = useState<boolean>(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        setForm({
          username: data.username,
          email: data.email,
          phone: data.phone,
          address: data.address,
        });
      } catch {
        Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (key: keyof Profile, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setIsModified(true);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateProfile(form);
      Alert.alert('Thành công', 'Thông tin đã được cập nhật');
      setIsModified(false);
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Thông tin cá nhân</Text>

      <TextInput
        style={styles.input}
        placeholder="Họ và tên"
        value={form.username}
        onChangeText={text => handleChange('username', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        onChangeText={text => handleChange('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Số điện thoại"
        value={form.phone}
        onChangeText={text => handleChange('phone', text)}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Địa chỉ"
        value={form.address}
        onChangeText={text => handleChange('address', text)}
      />

      <Button title={loading ? 'Đang xử lý...' : 'Cập nhật'} onPress={handleSubmit} disabled={!isModified || loading} />

      <View style={{ marginTop: 20 }}>
        <Button title="Đăng xuất" color="#e74c3c" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
});
