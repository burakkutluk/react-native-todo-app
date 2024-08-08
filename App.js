import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AddTodo from './components/AddTodo';
import EditTodo from './components/EditTodo';

const STORAGE_KEY = '@todos'; // AsyncStorage anahtarı

const Stack = createStackNavigator();

const HomeScreen = ({ navigation }) => {
  const [todos, setTodos] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'done', 'not_done'

  useEffect(() => {
    // Veriyi AsyncStorage'tan yükle
    const loadTodos = async () => {
      try {
        const storedTodos = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedTodos) {
          setTodos(JSON.parse(storedTodos));
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      }
    };
    loadTodos();
  }, []);

  useEffect(() => {
    // Veriyi AsyncStorage'a kaydet
    const saveTodos = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      } catch (error) {
        console.error('Veri kaydetme hatası:', error);
      }
    };
    saveTodos();
  }, [todos]);

  const toggleTodo = (id) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  };

  const addTodo = (text) => {
    const newTodo = { id: Date.now().toString(), text, done: false };
    setTodos([...todos, newTodo]);
  };

  const deleteTodo = (id) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  const handleEdit = (id, newText) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, text: newText } : todo
      )
    );
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'all') return true;
    if (filter === 'done') return todo.done;
    if (filter === 'not_done') return !todo.done;
    return true;
  });

  return (
    <View style={styles.container}>
       <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={styles.filterButtonText}>Hepsi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'done' && styles.activeFilter]}
          onPress={() => setFilter('done')}
        >
          <Text style={styles.filterButtonText}>Yapıldı</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'not_done' && styles.activeFilter]}
          onPress={() => setFilter('not_done')}
        >
          <Text style={styles.filterButtonText}>Yapılmadı</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredTodos}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedTodo(item);
              setIsEditModalVisible(true);
            }}
            style={styles.todoContainer}
          >
           <View style={styles.todoTextContainer}>
              <Text style={[styles.todoText, item.done && styles.todoDone]}>
                {item.text}
              </Text>
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => toggleTodo(item.id)}
              >
                <Text style={styles.buttonText}>
                  {item.done ? 'Yapıldı' : 'Yapılmadı'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteTodo(item.id)}
              >
                <Text style={styles.deleteButtonText}>Sil</Text>
              </TouchableOpacity>
            </View>
            </TouchableOpacity>
        )}
        keyExtractor={item => item.id}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Yeni To-Do Ekle</Text>
      </TouchableOpacity>
      <AddTodo
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAdd={addTodo}
      />
      {selectedTodo && (
        <EditTodo
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          onSave={handleEdit}
          todo={selectedTodo}
        />
      )}
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'To-Do List' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filterButton: {
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  activeFilter: {
    backgroundColor: '#007BFF',
  },
  filterButtonText: {
    color: '#000',
  },
  todoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  todoTextContainer: {
    flex: 1,
  },
  todoText: {
    flexShrink: 1,
    fontSize: 18,
  },
  todoDone: {
    textDecorationLine: 'line-through',
    color: 'grey',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    marginRight: 10,
  },
  buttonText: {
    color: '#fff',
  },
  deleteButton: {
    padding: 10,
    backgroundColor: '#dc3545',
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
  },
  addButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#28a745',
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default App;
