import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { ordersAPI } from '../services/api';

interface Stats {
  todayOrders: number;
  todayRevenue: number;
  activeOrders: number;
  lowStockItems: number;
}

export default function DashboardScreen() {
  const { user, hasPermission } = useAuth();
  const { orders, getLowStockItems, refreshOrders, refreshInventory } = useData();
  const [stats, setStats] = useState<Stats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const canViewRevenue = hasPermission('view_revenue');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        refreshOrders(),
        refreshInventory(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await ordersAPI.getStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando dashboard...</Text>
      </View>
    );
  }

  const activeOrders = orders.filter(
    order => order.status === 'pending' || order.status === 'preparing'
  );
  const lowStockItems = getLowStockItems();

  // Configurar las estadísticas según los permisos
  const statsCards = [
    {
      title: 'Órdenes Hoy',
      value: stats?.todayOrders.toString() || '0',
      color: '#007AFF',
      icon: 'receipt',
      show: true  // Todos pueden ver
    },
    {
      title: 'Ingresos Hoy',
      value: `$${stats?.todayRevenue.toFixed(2) || '0.00'}`,
      color: '#34C759',
      icon: 'attach-money',
      show: canViewRevenue  // Solo admin y manager
    },
    {
      title: 'Órdenes Activas',
      value: stats?.activeOrders.toString() || '0',
      color: '#FF9500',
      icon: 'pending-actions',
      show: true  // Todos pueden ver
    },
    {
      title: 'Stock Bajo',
      value: stats?.lowStockItems.toString() || '0',
      color: '#FF3B30',
      icon: 'warning',
      show: true  // Todos pueden ver
    },
  ].filter(stat => stat.show);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {user?.name}!</Text>
        <Text style={styles.role}>Rol: {user?.role.toUpperCase()}</Text>
      </View>

      <View style={styles.statsContainer}>
        {statsCards.map((stat, index) => (
          <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
            <MaterialIcons name={stat.icon as any} size={32} color={stat.color} />
            <View style={styles.statInfo}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Órdenes Activas</Text>
        {activeOrders.length === 0 ? (
          <Text style={styles.emptyText}>No hay órdenes activas</Text>
        ) : (
          activeOrders.slice(0, 5).map(order => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderTable}>Mesa {order.tableNumber}</Text>
                <Text style={[styles.orderStatus, styles[`status_${order.status}`]]}>
                  {order.status === 'pending' ? 'Pendiente' : 'Preparando'}
                </Text>
              </View>
              <Text style={styles.orderItems}>
                {order.items.length} items
                {canViewRevenue && ` - $${order.total.toFixed(2)}`}
              </Text>
              <Text style={styles.orderTime}>
                {new Date(order.createdAt).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          ))
        )}
      </View>

      {lowStockItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas de Inventario</Text>
          {lowStockItems.slice(0, 5).map(item => (
            <View key={item.id} style={styles.alertCard}>
              <MaterialIcons name="warning" size={24} color="#FF9500" />
              <View style={styles.alertInfo}>
                <Text style={styles.alertName}>{item.name}</Text>
                <Text style={styles.alertStock}>
                  Stock: {item.quantity} {item.unit} (Mínimo: {item.minStock})
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  role: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  statsContainer: {
    padding: 15,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statInfo: {
    flex: 1,
    marginLeft: 15,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    padding: 20,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderTable: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderStatus: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
  },
  status_pending: {
    backgroundColor: '#FFE5CC',
    color: '#FF9500',
  },
  status_preparing: {
    backgroundColor: '#CCE5FF',
    color: '#007AFF',
  },
  orderItems: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 12,
    color: '#999',
  },
  alertCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertInfo: {
    flex: 1,
    marginLeft: 15,
  },
  alertName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  alertStock: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
