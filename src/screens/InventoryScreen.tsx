import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { InventoryItem, InventoryCategory } from '../types';

export default function InventoryScreen() {
  const { hasPermission } = useAuth();
  const { inventory, updateInventoryItem, addInventoryItem, deleteInventoryItem } = useData();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const canEdit = hasPermission('edit_inventory');
  const canView = hasPermission('view_inventory');

  // Ordenar inventario alfabéticamente
  const sortedInventory = useMemo(() => {
    return [...inventory].sort((a, b) => a.name.localeCompare(b.name));
  }, [inventory]);

  const getCategoryLabel = (category: InventoryCategory) => {
    const labels: Record<InventoryCategory, string> = {
      beverages: 'Bebidas',
      food: 'Alimentos',
      supplies: 'Suministros',
      other: 'Otros',
    };
    return labels[category];
  };

  const isLowStock = (item: InventoryItem) => item.quantity < item.minStock;

  const lowStockCount = inventory.filter(isLowStock).length;

  const handleDeleteItem = (item: InventoryItem) => {
    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro de eliminar "${item.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteInventoryItem(item.id);
            setSelectedItem(null);
            setShowEditModal(false);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Inventario</Text>
          {lowStockCount > 0 && (
            <Text style={styles.subtitle}>
              ⚠️ {lowStockCount} productos con stock bajo
            </Text>
          )}
        </View>
        {canEdit && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <MaterialIcons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Agregar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Vista tipo Tabla */}
      <ScrollView style={styles.tableContainer}>
        {/* Header de la tabla */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.colName]}>Producto</Text>
          <Text style={[styles.tableHeaderText, styles.colCategory]}>Categoría</Text>
          <Text style={[styles.tableHeaderText, styles.colQuantity]}>Stock</Text>
          <Text style={[styles.tableHeaderText, styles.colPrice]}>Precio</Text>
          <Text style={[styles.tableHeaderText, styles.colSupplier]}>Proveedor</Text>
          <Text style={[styles.tableHeaderText, styles.colAction]}>Acción</Text>
        </View>

        {/* Filas de la tabla */}
        {sortedInventory.length === 0 ? (
          <Text style={styles.emptyText}>No hay productos en inventario</Text>
        ) : (
          sortedInventory.map((item) => (
            <View
              key={item.id}
              style={[
                styles.tableRow,
                isLowStock(item) && styles.lowStockRow
              ]}
            >
              <View style={[styles.tableCell, styles.colName]}>
                <Text style={styles.productName}>{item.name}</Text>
                {isLowStock(item) && (
                  <View style={styles.lowStockBadge}>
                    <MaterialIcons name="warning" size={12} color="#FF3B30" />
                    <Text style={styles.lowStockText}>Bajo</Text>
                  </View>
                )}
              </View>

              <Text style={[styles.tableCell, styles.colCategory, styles.categoryText]}>
                {getCategoryLabel(item.category)}
              </Text>

              <View style={[styles.tableCell, styles.colQuantity]}>
                <Text style={[
                  styles.stockText,
                  isLowStock(item) && styles.lowStockTextRed
                ]}>
                  {item.quantity} {item.unit}
                </Text>
                <Text style={styles.minStockText}>Mín: {item.minStock}</Text>
              </View>

              <Text style={[styles.tableCell, styles.colPrice, styles.priceText]}>
                ${item.price.toFixed(2)}/{item.unit}
              </Text>

              <Text style={[styles.tableCell, styles.colSupplier, styles.supplierText]}>
                {item.supplier || 'N/A'}
              </Text>

              <View style={[styles.tableCell, styles.colAction]}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setSelectedItem(item);
                    setShowEditModal(true);
                  }}
                  disabled={!canEdit}
                >
                  <MaterialIcons
                    name="edit"
                    size={20}
                    color={canEdit ? '#007AFF' : '#CCC'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de Agregar Producto */}
      <AddProductModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(newItem) => {
          addInventoryItem(newItem);
          setShowAddModal(false);
          Alert.alert('Éxito', 'Producto agregado correctamente');
        }}
      />

      {/* Modal de Editar Producto */}
      {selectedItem && (
        <EditProductModal
          visible={showEditModal}
          item={selectedItem}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSave={(updatedItem) => {
            updateInventoryItem(updatedItem);
            setShowEditModal(false);
            setSelectedItem(null);
            Alert.alert('Éxito', 'Producto actualizado correctamente');
          }}
          onDelete={handleDeleteItem}
          canEdit={canEdit}
        />
      )}
    </View>
  );
}

// Modal de Agregar Producto
const AddProductModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSave: (item: Omit<InventoryItem, 'id' | 'lastUpdated'>) => void;
}> = ({ visible, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('food');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [minStock, setMinStock] = useState('');
  const [price, setPrice] = useState('');
  const [supplier, setSupplier] = useState('');

  const resetForm = () => {
    setName('');
    setCategory('food');
    setQuantity('');
    setUnit('');
    setMinStock('');
    setPrice('');
    setSupplier('');
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del producto es obligatorio');
      return;
    }
    if (!quantity || !unit || !minStock || !price) {
      Alert.alert('Error', 'Completa todos los campos obligatorios');
      return;
    }

    onSave({
      name: name.trim(),
      category,
      quantity: parseFloat(quantity),
      unit: unit.trim(),
      minStock: parseFloat(minStock),
      price: parseFloat(price),
      supplier: supplier.trim() || undefined,
    });

    resetForm();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Agregar Producto</Text>

          <ScrollView style={styles.formScroll}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del Producto *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ej: Tomates"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Categoría *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={category}
                  onValueChange={(value) => setCategory(value as InventoryCategory)}
                  style={styles.picker}
                >
                  <Picker.Item label="Alimentos" value="food" />
                  <Picker.Item label="Bebidas" value="beverages" />
                  <Picker.Item label="Suministros" value="supplies" />
                  <Picker.Item label="Otros" value="other" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, styles.inputHalf]}>
                <Text style={styles.inputLabel}>Cantidad *</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>

              <View style={[styles.inputGroup, styles.inputHalf]}>
                <Text style={styles.inputLabel}>Unidad *</Text>
                <TextInput
                  style={styles.input}
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="kg, L, units"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, styles.inputHalf]}>
                <Text style={styles.inputLabel}>Stock Mínimo *</Text>
                <TextInput
                  style={styles.input}
                  value={minStock}
                  onChangeText={setMinStock}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>

              <View style={[styles.inputGroup, styles.inputHalf]}>
                <Text style={styles.inputLabel}>Precio *</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholder="0.00"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Proveedor</Text>
              <TextInput
                style={styles.input}
                value={supplier}
                onChangeText={setSupplier}
                placeholder="Nombre del proveedor (opcional)"
              />
            </View>
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => {
                resetForm();
                onClose();
              }}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Text style={styles.modalButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Modal de Editar Producto
const EditProductModal: React.FC<{
  visible: boolean;
  item: InventoryItem;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  canEdit: boolean;
}> = ({ visible, item, onClose, onSave, onDelete, canEdit }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('food');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [minStock, setMinStock] = useState('');
  const [price, setPrice] = useState('');
  const [supplier, setSupplier] = useState('');

  React.useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setQuantity(item.quantity.toString());
      setUnit(item.unit);
      setMinStock(item.minStock.toString());
      setPrice(item.price.toString());
      setSupplier(item.supplier || '');
    }
  }, [item]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre del producto es obligatorio');
      return;
    }
    if (!quantity || !unit || !minStock || !price) {
      Alert.alert('Error', 'Completa todos los campos obligatorios');
      return;
    }

    onSave({
      ...item,
      name: name.trim(),
      category,
      quantity: parseFloat(quantity),
      unit: unit.trim(),
      minStock: parseFloat(minStock),
      price: parseFloat(price),
      supplier: supplier.trim() || undefined,
    });
  };

  const getCategoryLabel = (cat: InventoryCategory) => {
    const labels: Record<InventoryCategory, string> = {
      beverages: 'Bebidas',
      food: 'Alimentos',
      supplies: 'Suministros',
      other: 'Otros',
    };
    return labels[cat];
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {canEdit ? 'Editar Producto' : 'Detalle del Producto'}
          </Text>

          <ScrollView style={styles.formScroll}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del Producto *</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ej: Tomates"
                editable={canEdit}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Categoría *</Text>
              {canEdit ? (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={category}
                    onValueChange={(value) => setCategory(value as InventoryCategory)}
                    style={styles.picker}
                    enabled={canEdit}
                  >
                    <Picker.Item label="Alimentos" value="food" />
                    <Picker.Item label="Bebidas" value="beverages" />
                    <Picker.Item label="Suministros" value="supplies" />
                    <Picker.Item label="Otros" value="other" />
                  </Picker>
                </View>
              ) : (
                <Text style={styles.disabledText}>{getCategoryLabel(category)}</Text>
              )}
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, styles.inputHalf]}>
                <Text style={styles.inputLabel}>Cantidad *</Text>
                <TextInput
                  style={styles.input}
                  value={quantity}
                  onChangeText={setQuantity}
                  keyboardType="numeric"
                  placeholder="0"
                  editable={canEdit}
                />
              </View>

              <View style={[styles.inputGroup, styles.inputHalf]}>
                <Text style={styles.inputLabel}>Unidad *</Text>
                <TextInput
                  style={styles.input}
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="kg, L, units"
                  editable={canEdit}
                />
              </View>
            </View>

            {canEdit && (
              <View style={styles.quickActions}>
                <Text style={styles.quickActionsLabel}>Ajustes rápidos de cantidad:</Text>
                <View style={styles.quickButtons}>
                  <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => setQuantity((prev) => (parseFloat(prev || '0') + 10).toString())}
                  >
                    <Text style={styles.quickButtonText}>+10</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => setQuantity((prev) => Math.max(0, parseFloat(prev || '0') - 10).toString())}
                  >
                    <Text style={styles.quickButtonText}>-10</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickButton}
                    onPress={() => setQuantity('0')}
                  >
                    <Text style={styles.quickButtonText}>Reset</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, styles.inputHalf]}>
                <Text style={styles.inputLabel}>Stock Mínimo *</Text>
                <TextInput
                  style={styles.input}
                  value={minStock}
                  onChangeText={setMinStock}
                  keyboardType="numeric"
                  placeholder="0"
                  editable={canEdit}
                />
              </View>

              <View style={[styles.inputGroup, styles.inputHalf]}>
                <Text style={styles.inputLabel}>Precio *</Text>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholder="0.00"
                  editable={canEdit}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Proveedor</Text>
              <TextInput
                style={styles.input}
                value={supplier}
                onChangeText={setSupplier}
                placeholder="Nombre del proveedor (opcional)"
                editable={canEdit}
              />
            </View>

            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Última actualización:</Text>
              <Text style={styles.infoValue}>
                {new Date(item.lastUpdated).toLocaleString('es-ES')}
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalButtons}>
            {canEdit && (
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={() => onDelete(item)}
              >
                <Text style={styles.modalButtonText}>Eliminar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.modalButtonText}>Cerrar</Text>
            </TouchableOpacity>
            {canEdit && (
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.modalButtonText}>Guardar</Text>
              </TouchableOpacity>
            )}
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
  subtitle: {
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#34C759',
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
    backgroundColor: '#34C759',
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
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lowStockRow: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  tableCell: {
    justifyContent: 'center',
  },
  colName: {
    width: 140,
  },
  colCategory: {
    width: 90,
  },
  colQuantity: {
    width: 80,
  },
  colPrice: {
    width: 80,
  },
  colSupplier: {
    width: 100,
  },
  colAction: {
    width: 50,
    alignItems: 'center',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  lowStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  lowStockText: {
    fontSize: 10,
    color: '#FF3B30',
    fontWeight: '600',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
  },
  stockText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  lowStockTextRed: {
    color: '#FF3B30',
  },
  minStockText: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34C759',
  },
  supplierText: {
    fontSize: 12,
    color: '#666',
  },
  actionButton: {
    padding: 5,
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
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  formScroll: {
    maxHeight: 500,
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
    padding: 12,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputHalf: {
    flex: 1,
  },
  quickActions: {
    marginBottom: 15,
  },
  quickActionsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginTop: 4,
  },
  disabledText: {
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    gap: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
