import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_PERMISSIONS } from '../utils/permissions';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  if (!user) return null;

  const permissions = ROLE_PERMISSIONS[user.role];

  const getPermissionLabel = (permission: string) => {
    const labels: Record<string, string> = {
      view_dashboard: 'Ver Dashboard',
      view_orders: 'Ver Órdenes',
      create_order: 'Crear Órdenes',
      edit_order: 'Editar Órdenes',
      delete_order: 'Eliminar Órdenes',
      view_inventory: 'Ver Inventario',
      edit_inventory: 'Editar Inventario',
      manage_users: 'Gestionar Usuarios',
      view_reports: 'Ver Reportes',
    };
    return labels[permission] || permission;
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      manager: 'Gerente',
      waiter: 'Mesero',
      chef: 'Chef',
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: '#FF3B30',
      manager: '#FF9500',
      waiter: '#007AFF',
      chef: '#34C759',
    };
    return colors[role] || '#8E8E93';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(user.role) }]}>
          <Text style={styles.roleText}>{getRoleLabel(user.role)}</Text>
        </View>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Usuario:</Text>
            <Text style={styles.infoValue}>{user.username}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID:</Text>
            <Text style={styles.infoValue}>{user.id}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permisos del Rol</Text>
        <View style={styles.permissionsCard}>
          {permissions.map((permission, index) => (
            <View key={index} style={styles.permissionRow}>
              <Text style={styles.permissionIcon}>✓</Text>
              <Text style={styles.permissionText}>{getPermissionLabel(permission)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Roles Disponibles</Text>
        <Text style={styles.helperText}>
          Puedes cerrar sesión e ingresar con diferentes usuarios para probar los permisos:
        </Text>
        <View style={styles.rolesCard}>
          <View style={styles.roleRow}>
            <View style={[styles.roleIndicator, { backgroundColor: '#FF3B30' }]} />
            <View style={styles.roleInfo}>
              <Text style={styles.roleLabel}>Admin (admin/admin123)</Text>
              <Text style={styles.roleDescription}>Acceso total al sistema</Text>
            </View>
          </View>
          <View style={styles.roleRow}>
            <View style={[styles.roleIndicator, { backgroundColor: '#FF9500' }]} />
            <View style={styles.roleInfo}>
              <Text style={styles.roleLabel}>Manager (manager/manager123)</Text>
              <Text style={styles.roleDescription}>Gestión de órdenes e inventario</Text>
            </View>
          </View>
          <View style={styles.roleRow}>
            <View style={[styles.roleIndicator, { backgroundColor: '#007AFF' }]} />
            <View style={styles.roleInfo}>
              <Text style={styles.roleLabel}>Mesero (waiter/waiter123)</Text>
              <Text style={styles.roleDescription}>Crear y gestionar órdenes</Text>
            </View>
          </View>
          <View style={styles.roleRow}>
            <View style={[styles.roleIndicator, { backgroundColor: '#34C759' }]} />
            <View style={styles.roleInfo}>
              <Text style={styles.roleLabel}>Chef (chef/chef123)</Text>
              <Text style={styles.roleDescription}>Ver y actualizar órdenes</Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Restaurant App v1.0</Text>
        <Text style={styles.footerText}>Sistema de Gestión</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    fontSize: 36,
    color: 'white',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 8,
  },
  roleText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  permissionsCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  permissionIcon: {
    fontSize: 16,
    color: '#34C759',
    marginRight: 10,
    fontWeight: 'bold',
  },
  permissionText: {
    fontSize: 14,
    color: '#333',
  },
  helperText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  rolesCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  roleIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  roleInfo: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  roleDescription: {
    fontSize: 12,
    color: '#666',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    margin: 15,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
