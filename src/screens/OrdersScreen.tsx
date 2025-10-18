import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Order, OrderStatus } from '../types';
import { MENU_ITEMS } from '../data/dummyData';

export default function OrdersScreen() {
  const { hasPermission, user } = useAuth();
  const { orders, updateOrderStatus, deleteOrder, addOrder } = useData();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

  const canCreateOrder = hasPermission('create_order');
  const canEditOrder = hasPermission('edit_order');
  const canDeleteOrder = hasPermission('delete_order');

  const filteredOrders =
    filterStatus === 'all'
      ? orders
      : orders.filter(order => order.status === filterStatus);

  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<OrderStatus, string> = {
      pending: 'Pendiente',
      preparing: 'Preparando',
      ready: 'Lista',
      delivered: 'Entregada',
      cancelled: 'Cancelada',
    };
    return labels[status];
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      pending: '#FF9500',
      preparing: '#007AFF',
      ready: '#34C759',
      delivered: '#8E8E93',
      cancelled: '#FF3B30',
    };
    return colors[status];
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    setSelectedOrder(null);
  };

  const handleDeleteOrder = (orderId: string) => {
    Alert.alert(
      'Eliminar Orden',
      '¿Estás seguro de eliminar esta orden?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteOrder(orderId);
            setSelectedOrder(null);
          },
        },
      ]
    );
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => setSelectedOrder(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderTable}>Mesa {item.tableNumber}</Text>
        <Text
          style={[
            styles.orderStatus,
            { backgroundColor: getStatusColor(item.status) + '33', color: getStatusColor(item.status) },
          ]}
        >
          {getStatusLabel(item.status)}
        </Text>
      </View>
      <Text style={styles.orderItems}>
        {item.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
      </Text>
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
        <Text style={styles.orderTime}>
          {new Date(item.createdAt).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <Text style={styles.orderCreator}>Por: {item.createdBy}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Órdenes</Text>
        {canCreateOrder && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowNewOrderModal(true)}
          >
            <Text style={styles.addButtonText}>+ Nueva</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'pending', 'preparing', 'ready', 'delivered'].map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filterStatus === status && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus(status as OrderStatus | 'all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === status && styles.filterButtonTextActive,
              ]}
            >
              {status === 'all' ? 'Todas' : getStatusLabel(status as OrderStatus)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay órdenes</Text>
        }
      />

      {/* Order Detail Modal */}
      <Modal
        visible={selectedOrder !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedOrder && (
              <>
                <Text style={styles.modalTitle}>Orden - Mesa {selectedOrder.tableNumber}</Text>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Estado:</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      { color: getStatusColor(selectedOrder.status) },
                    ]}
                  >
                    {getStatusLabel(selectedOrder.status)}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Items:</Text>
                  {selectedOrder.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <Text style={styles.itemText}>
                        {item.quantity}x {item.name}
                      </Text>
                      <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>${selectedOrder.total.toFixed(2)}</Text>
                </View>

                {canEditOrder && selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                  <View style={styles.actionButtons}>
                    <Text style={styles.actionsLabel}>Cambiar estado:</Text>
                    <View style={styles.statusButtons}>
                      {['pending', 'preparing', 'ready', 'delivered'].map(status => (
                        <TouchableOpacity
                          key={status}
                          style={[
                            styles.statusButton,
                            { backgroundColor: getStatusColor(status as OrderStatus) },
                          ]}
                          onPress={() => handleStatusChange(selectedOrder.id, status as OrderStatus)}
                        >
                          <Text style={styles.statusButtonText}>
                            {getStatusLabel(status as OrderStatus)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.modalButtons}>
                  {canDeleteOrder && (
                    <TouchableOpacity
                      style={[styles.modalButton, styles.deleteButton]}
                      onPress={() => handleDeleteOrder(selectedOrder.id)}
                    >
                      <Text style={styles.modalButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.modalButton, styles.closeButton]}
                    onPress={() => setSelectedOrder(null)}
                  >
                    <Text style={styles.modalButtonText}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* New Order Modal */}
      <NewOrderModal
        visible={showNewOrderModal}
        onClose={() => setShowNewOrderModal(false)}
        onSubmit={(orderData) => {
          addOrder({
            ...orderData,
            createdBy: user?.name || 'Usuario',
          });
          setShowNewOrderModal(false);
          Alert.alert('Éxito', 'Orden creada correctamente');
        }}
      />
    </View>
  );
}

// New Order Modal Component
const NewOrderModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ visible, onClose, onSubmit }) => {
  const [tableNumber, setTableNumber] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});

  const handleAddItem = (itemId: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newItems = { ...prev };
      if (newItems[itemId] > 1) {
        newItems[itemId]--;
      } else {
        delete newItems[itemId];
      }
      return newItems;
    });
  };

  const handleSubmit = () => {
    if (!tableNumber || Object.keys(selectedItems).length === 0) {
      Alert.alert('Error', 'Ingresa número de mesa y selecciona al menos un item');
      return;
    }

    const items = Object.entries(selectedItems).map(([itemId, quantity]) => {
      const menuItem = MENU_ITEMS.find(i => i.id === itemId)!;
      return {
        id: itemId,
        name: menuItem.name,
        quantity,
        price: menuItem.price,
      };
    });

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    onSubmit({
      tableNumber: parseInt(tableNumber),
      items,
      total,
      status: 'pending' as OrderStatus,
    });

    setTableNumber('');
    setSelectedItems({});
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Nueva Orden</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Número de Mesa:</Text>
            <input
              style={styles.input}
              placeholder="Ej: 5"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              type="number"
            />
          </View>

          <Text style={styles.menuTitle}>Menú:</Text>
          <ScrollView style={styles.menuScroll}>
            {MENU_ITEMS.map(item => (
              <View key={item.id} style={styles.menuItem}>
                <View style={styles.menuItemInfo}>
                  <Text style={styles.menuItemName}>{item.name}</Text>
                  <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
                </View>
                <View style={styles.quantityControls}>
                  {selectedItems[item.id] ? (
                    <>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleRemoveItem(item.id)}
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantity}>{selectedItems[item.id]}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => handleAddItem(item.id)}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.addItemButton}
                      onPress={() => handleAddItem(item.id)}
                    >
                      <Text style={styles.addItemButtonText}>Agregar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.closeButton]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.modalButtonText}>Crear Orden</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  listContainer: {
    padding: 15,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 10,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  orderStatus: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '600',
  },
  orderItems: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  orderTime: {
    fontSize: 12,
    color: '#999',
  },
  orderCreator: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 50,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  detailSection: {
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  actionButtons: {
    marginBottom: 15,
  },
  actionsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  statusButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  closeButton: {
    backgroundColor: '#8E8E93',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  menuScroll: {
    maxHeight: 300,
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 14,
    color: '#333',
  },
  menuItemPrice: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#007AFF',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantity: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  addItemButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addItemButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
