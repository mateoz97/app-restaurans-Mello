import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Order, OrderStatus, OrderType, PaymentStatus } from '../types';
import { MENU_ITEMS } from '../data/dummyData';

export default function OrdersScreen() {
  const { hasPermission, user } = useAuth();
  const { orders, updateOrderStatus, deleteOrder, addOrder, updateOrder } = useData();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const canCreateOrder = hasPermission('create_order');
  const canEditOrder = hasPermission('edit_order');
  const canDeleteOrder = hasPermission('delete_order');

  // Ordenar por fecha de creación (orden de llegada)
  const sortedOrders = useMemo(() => {
    return [...orders].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [orders]);

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

  const getStatusIcon = (status: OrderStatus) => {
    const icons: Record<OrderStatus, keyof typeof MaterialIcons.glyphMap> = {
      pending: 'schedule',
      preparing: 'restaurant',
      ready: 'check-circle',
      delivered: 'done-all',
      cancelled: 'cancel',
    };
    return icons[status];
  };

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  const handlePaymentToggle = (order: Order) => {
    const newPaymentStatus: PaymentStatus = order.paymentStatus === 'paid' ? 'pending' : 'paid';
    updateOrder(order.id, { ...order, paymentStatus: newPaymentStatus });
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Órdenes</Text>
        {canCreateOrder && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowNewOrderModal(true)}
          >
            <MaterialIcons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Nueva</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Vista tipo Tabla */}
      <ScrollView style={styles.tableContainer}>
        {/* Header de la tabla */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colOrder]}>#</Text>
          <Text style={[styles.tableHeaderText, styles.colType]}>Mesa/Tipo</Text>
          <Text style={[styles.tableHeaderText, styles.colItems]}>Items</Text>
          <Text style={[styles.tableHeaderText, styles.colStatus]}>Estado</Text>
          <Text style={[styles.tableHeaderText, styles.colPayment]}>Pago</Text>
          <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
          <Text style={[styles.tableHeaderText, styles.colTime]}>Hora</Text>
        </View>

        {/* Filas de la tabla */}
        {sortedOrders.length === 0 ? (
          <Text style={styles.emptyText}>No hay órdenes</Text>
        ) : (
          sortedOrders.map((order, index) => (
            <TouchableOpacity
              key={order.id}
              style={styles.tableRow}
              onPress={() => setSelectedOrder(order)}
            >
              <Text style={[styles.tableCell, styles.colOrder]}>
                {String(index + 1).padStart(3, '0')}
              </Text>

              <View style={[styles.tableCell, styles.colType]}>
                <MaterialIcons
                  name={order.orderType === 'dine-in' ? 'restaurant' : 'shopping-bag'}
                  size={16}
                  color="#666"
                />
                <Text style={styles.tableCellText}>
                  {order.orderType === 'dine-in'
                    ? `Mesa ${order.tableNumber}`
                    : 'Llevar'}
                </Text>
              </View>

              <Text style={[styles.tableCell, styles.colItems]}>
                {order.items.length}
              </Text>

              <View style={[styles.tableCell, styles.colStatus]}>
                <MaterialIcons
                  name={getStatusIcon(order.status)}
                  size={16}
                  color={getStatusColor(order.status)}
                />
              </View>

              <View style={[styles.tableCell, styles.colPayment]}>
                {order.paymentStatus === 'paid' ? (
                  <MaterialIcons name="check-circle" size={18} color="#34C759" />
                ) : (
                  <MaterialIcons name="schedule" size={18} color="#FF9500" />
                )}
              </View>

              <Text style={[styles.tableCell, styles.colTotal, styles.totalAmount]}>
                ${order.total.toFixed(2)}
              </Text>

              <Text style={[styles.tableCell, styles.colTime]}>
                {new Date(order.createdAt).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Modal de Detalle */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          visible={selectedOrder !== null}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          onPaymentToggle={handlePaymentToggle}
          onDelete={handleDeleteOrder}
          onEdit={() => {
            setShowEditModal(true);
          }}
          canEdit={canEditOrder}
          canDelete={canDeleteOrder}
          getStatusLabel={getStatusLabel}
          getStatusColor={getStatusColor}
        />
      )}

      {/* Modal de Nueva Orden */}
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

      {/* Modal de Editar Orden */}
      {selectedOrder && (
        <EditOrderModal
          visible={showEditModal}
          order={selectedOrder}
          onClose={() => setShowEditModal(false)}
          onSubmit={(updatedOrder) => {
            updateOrder(selectedOrder.id, updatedOrder);
            setShowEditModal(false);
            setSelectedOrder(null);
            Alert.alert('Éxito', 'Orden actualizada correctamente');
          }}
        />
      )}
    </View>
  );
}

// Modal de Detalle de Orden
const OrderDetailModal: React.FC<{
  order: Order;
  visible: boolean;
  onClose: () => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  onPaymentToggle: (order: Order) => void;
  onDelete: (orderId: string) => void;
  onEdit: () => void;
  canEdit: boolean;
  canDelete: boolean;
  getStatusLabel: (status: OrderStatus) => string;
  getStatusColor: (status: OrderStatus) => string;
}> = ({ order, visible, onClose, onStatusChange, onPaymentToggle, onDelete, onEdit, canEdit, canDelete, getStatusLabel, getStatusColor }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Orden #{order.id}
          </Text>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Tipo de Pedido:</Text>
            <View style={styles.detailRow}>
              <MaterialIcons
                name={order.orderType === 'dine-in' ? 'restaurant' : 'shopping-bag'}
                size={20}
                color="#007AFF"
              />
              <Text style={styles.detailValue}>
                {order.orderType === 'dine-in'
                  ? `Para comer aquí - Mesa ${order.tableNumber}`
                  : 'Para llevar'}
              </Text>
            </View>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Estado de Pago:</Text>
            <TouchableOpacity
              style={styles.paymentToggle}
              onPress={() => canEdit && onPaymentToggle(order)}
              disabled={!canEdit}
            >
              <MaterialIcons
                name={order.paymentStatus === 'paid' ? 'check-circle' : 'schedule'}
                size={20}
                color={order.paymentStatus === 'paid' ? '#34C759' : '#FF9500'}
              />
              <Text style={[
                styles.detailValue,
                { color: order.paymentStatus === 'paid' ? '#34C759' : '#FF9500' }
              ]}>
                {order.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente de pago'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Estado:</Text>
            <Text style={[styles.detailValue, { color: getStatusColor(order.status) }]}>
              {getStatusLabel(order.status)}
            </Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Items:</Text>
            {order.items.map((item, index) => (
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
            <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Hora:</Text>
            <Text style={styles.detailValue}>
              {new Date(order.createdAt).toLocaleString('es-ES')}
            </Text>
          </View>

          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Creado por:</Text>
            <Text style={styles.detailValue}>{order.createdBy}</Text>
          </View>

          {canEdit && (
            <View style={styles.actionButtons}>
              <Text style={styles.actionsLabel}>Cambiar estado:</Text>
              <View style={styles.statusButtons}>
                {(['pending', 'preparing', 'ready', 'delivered', 'cancelled'] as OrderStatus[]).map(status => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      { backgroundColor: getStatusColor(status) },
                      order.status === status && styles.statusButtonActive
                    ]}
                    onPress={() => onStatusChange(order.id, status)}
                  >
                    <Text style={styles.statusButtonText}>
                      {getStatusLabel(status)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.modalButtons}>
            {canEdit && (
              <TouchableOpacity
                style={[styles.modalButton, styles.editButton]}
                onPress={onEdit}
              >
                <Text style={styles.modalButtonText}>Editar</Text>
              </TouchableOpacity>
            )}
            {canDelete && (
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={() => onDelete(order.id)}
              >
                <Text style={styles.modalButtonText}>Eliminar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.modalButton, styles.closeButton]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Modal de Nueva Orden
const NewOrderModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ visible, onClose, onSubmit }) => {
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});
  const [isPaid, setIsPaid] = useState(false);

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
    if (orderType === 'dine-in' && !tableNumber) {
      Alert.alert('Error', 'Ingresa número de mesa para pedidos en sitio');
      return;
    }

    if (Object.keys(selectedItems).length === 0) {
      Alert.alert('Error', 'Selecciona al menos un item');
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
      tableNumber: orderType === 'dine-in' ? parseInt(tableNumber) : undefined,
      orderType,
      paymentStatus: isPaid ? 'paid' : 'pending',
      items,
      total,
      status: 'pending' as OrderStatus,
    });

    // Reset form
    setOrderType('dine-in');
    setTableNumber('');
    setSelectedItems({});
    setIsPaid(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Nueva Orden</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tipo de Pedido:</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setOrderType('dine-in')}
              >
                <MaterialIcons
                  name={orderType === 'dine-in' ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={24}
                  color="#007AFF"
                />
                <Text style={styles.radioLabel}>Para comer aquí</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => setOrderType('takeaway')}
              >
                <MaterialIcons
                  name={orderType === 'takeaway' ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={24}
                  color="#007AFF"
                />
                <Text style={styles.radioLabel}>Para llevar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {orderType === 'dine-in' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Número de Mesa:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 5"
                value={tableNumber}
                onChangeText={setTableNumber}
                keyboardType="number-pad"
              />
            </View>
          )}

          <Text style={styles.menuTitle}>Seleccionar Items:</Text>
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

          <View style={styles.paymentSwitch}>
            <Text style={styles.inputLabel}>Marcar como pagado:</Text>
            <Switch
              value={isPaid}
              onValueChange={setIsPaid}
              trackColor={{ false: '#E0E0E0', true: '#34C759' }}
              thumbColor={isPaid ? '#FFF' : '#FFF'}
            />
          </View>

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

// Modal de Editar Orden
const EditOrderModal: React.FC<{
  visible: boolean;
  order: Order;
  onClose: () => void;
  onSubmit: (order: Order) => void;
}> = ({ visible, order, onClose, onSubmit }) => {
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>({});

  React.useEffect(() => {
    if (order) {
      const itemsMap: { [key: string]: number } = {};
      order.items.forEach(item => {
        itemsMap[item.id] = item.quantity;
      });
      setSelectedItems(itemsMap);
    }
  }, [order]);

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
    if (Object.keys(selectedItems).length === 0) {
      Alert.alert('Error', 'Selecciona al menos un item');
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
      ...order,
      items,
      total,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Editar Orden #{order.id}</Text>

          <Text style={styles.menuTitle}>Modificar Items:</Text>
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
              <Text style={styles.modalButtonText}>Guardar Cambios</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  tableContainer: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  tableHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tableCell: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  tableCellText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
  },
  colOrder: {
    width: 50,
  },
  colType: {
    width: 90,
    gap: 4,
  },
  colItems: {
    width: 50,
  },
  colStatus: {
    width: 60,
  },
  colPayment: {
    width: 50,
  },
  colTotal: {
    width: 70,
  },
  colTime: {
    width: 70,
  },
  totalAmount: {
    fontWeight: '600',
    color: '#007AFF',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 50,
    padding: 20,
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
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  detailSection: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    marginTop: 5,
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
  statusButtonActive: {
    borderWidth: 2,
    borderColor: '#333',
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
    gap: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#8E8E93',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  editButton: {
    backgroundColor: '#FF9500',
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
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 20,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  menuScroll: {
    maxHeight: 250,
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
  paymentSwitch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
  },
});
