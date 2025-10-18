import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { InventoryItem, InventoryCategory } from '../types';

export default function InventoryScreen() {
  const { hasPermission } = useAuth();
  const { inventory, updateInventoryItem } = useData();
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<InventoryCategory | 'all'>('all');

  const canEdit = hasPermission('edit_inventory');

  const filteredInventory =
    filterCategory === 'all'
      ? inventory
      : inventory.filter(item => item.category === filterCategory);

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

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => (
    <TouchableOpacity
      style={[styles.itemCard, isLowStock(item) && styles.lowStockCard]}
      onPress={() => canEdit && setSelectedItem(item)}
    >
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        {isLowStock(item) && <Text style={styles.lowStockBadge}>Stock Bajo</Text>}
      </View>
      <Text style={styles.itemCategory}>{getCategoryLabel(item.category)}</Text>
      <View style={styles.itemDetails}>
        <Text style={styles.itemStock}>
          Stock: {item.quantity} {item.unit}
        </Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}/{item.unit}</Text>
      </View>
      <Text style={styles.itemSupplier}>Proveedor: {item.supplier || 'N/A'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventario</Text>
        <Text style={styles.subtitle}>
          {inventory.filter(isLowStock).length} items con stock bajo
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'food', 'beverages', 'supplies', 'other'].map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.filterButton,
              filterCategory === category && styles.filterButtonActive,
            ]}
            onPress={() => setFilterCategory(category as InventoryCategory | 'all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterCategory === category && styles.filterButtonTextActive,
              ]}
            >
              {category === 'all' ? 'Todos' : getCategoryLabel(category as InventoryCategory)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredInventory}
        renderItem={renderInventoryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay items en inventario</Text>
        }
      />

      {/* Edit Item Modal */}
      <EditItemModal
        item={selectedItem}
        visible={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        onSave={(updatedItem) => {
          updateInventoryItem(updatedItem);
          setSelectedItem(null);
          Alert.alert('Éxito', 'Item actualizado correctamente');
        }}
      />
    </View>
  );
}

// Edit Item Modal Component
const EditItemModal: React.FC<{
  item: InventoryItem | null;
  visible: boolean;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
}> = ({ item, visible, onClose, onSave }) => {
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [minStock, setMinStock] = useState('');

  React.useEffect(() => {
    if (item) {
      setQuantity(item.quantity.toString());
      setPrice(item.price.toString());
      setMinStock(item.minStock.toString());
    }
  }, [item]);

  const handleSave = () => {
    if (!item) return;

    const updatedItem: InventoryItem = {
      ...item,
      quantity: parseFloat(quantity) || item.quantity,
      price: parseFloat(price) || item.price,
      minStock: parseFloat(minStock) || item.minStock,
    };

    onSave(updatedItem);
  };

  if (!item) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Editar Item</Text>

          <View style={styles.itemInfo}>
            <Text style={styles.itemInfoName}>{item.name}</Text>
            <Text style={styles.itemInfoCategory}>
              {item.category} - {item.unit}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cantidad en Stock:</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Precio por {item.unit}:</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="0.00"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Stock Mínimo:</Text>
            <TextInput
              style={styles.input}
              value={minStock}
              onChangeText={setMinStock}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          <View style={styles.quickActions}>
            <Text style={styles.quickActionsLabel}>Ajustes rápidos:</Text>
            <View style={styles.quickButtons}>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => setQuantity((prev) => (parseInt(prev) + 10).toString())}
              >
                <Text style={styles.quickButtonText}>+10</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickButton}
                onPress={() => setQuantity((prev) => Math.max(0, parseInt(prev) - 10).toString())}
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

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={onClose}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 15,
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
  itemCard: {
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
  lowStockCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  lowStockBadge: {
    backgroundColor: '#FF3B30',
    color: 'white',
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontWeight: '600',
  },
  itemCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  itemStock: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  itemSupplier: {
    fontSize: 12,
    color: '#999',
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  itemInfo: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  itemInfoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemInfoCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
    padding: 12,
    fontSize: 16,
  },
  quickActions: {
    marginBottom: 20,
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
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
