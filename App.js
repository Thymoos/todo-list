import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ScreenOrientation from 'expo-screen-orientation';
import SplashScreen from "./components/SplashScreen";

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');

  // Obsługa zmiany orientacji urządzenia i splashScreen
  useEffect(() => {
    const enableRotation = async () => {
      await ScreenOrientation.unlockAsync();
    };
    enableRotation();

    const splashTimeout = setTimeout(() => {
      setIsSplashVisible(false);
    }, 3000);

    return () => clearTimeout(splashTimeout);
  }, []);

  // Dodawanie zadania
  const addTask = () => {
    if (task.trim()) {
      setTasks([...tasks, { id: Date.now().toString(), text: task, completed: false }]);
      setTask('');
    }
  };

  // Usuwanie zadania
  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  // Oznaczanie zadania jako wykonane
  const toggleTaskCompletion = (id) => {
    setTasks(
        tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
        )
    );
  };

  // Otwieranie modala z edycją
  const openTaskDetails = (task) => {
    setSelectedTask(task);
    setNewTaskText(task.text);
  };

  // Zamykanie modala
  const closeTaskDetails = () => {
    setSelectedTask(null);
    setNewTaskText('');
  };

  // Zapisanie zmian w zadaniu
  const saveTask = () => {
    setTasks(
        tasks.map((task) =>
            task.id === selectedTask.id ? { ...task, text: newTaskText } : task
        )
    );
    closeTaskDetails();
  };

  if (isSplashVisible) {
    return <SplashScreen />;
  }

  return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <Text style={styles.header}>To-Do List</Text>
            <View style={styles.inputContainer}>
              <TextInput
                  style={styles.input}
                  placeholder="Add a new task"
                  value={task}
                  onChangeText={setTask}
              />
              <TouchableOpacity style={styles.addButton} onPress={addTask}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.taskContainer}>
                      <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)}>
                        <Icon
                            name={item.completed ? 'check-circle' : 'radio-button-unchecked'}
                            size={24}
                            color={item.completed ? '#007bff' : 'gray'}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => openTaskDetails(item)} style={{flex: 1}}>
                        <Text
                            style={[
                              styles.taskText,
                              item.completed && styles.completedTaskText,
                            ]}
                        >
                          {item.text}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteTask(item.id)}>
                        <Icon name="delete" size={24} color="red" />
                      </TouchableOpacity>
                    </View>
                )}
            />
          </View>

          {/* Modal dla edycji zadań*/}
          {selectedTask && (
              <Modal
                  visible={true}
                  animationType="slide"
                  onRequestClose={closeTaskDetails}
              >
                <View style={styles.modalContainer}>
                  <Text style={styles.modalHeader}>Edit Task</Text>
                  <TextInput
                      style={styles.modalInput}
                      value={newTaskText}
                      onChangeText={setNewTaskText}
                  />
                  <View style={styles.modalButtons}>
                    <TouchableOpacity style={styles.saveButton} onPress={saveTask}>
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={closeTaskDetails}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
          )}
        </SafeAreaView>
      </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  taskText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    width: '100%',
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
