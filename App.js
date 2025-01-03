import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal, Animated, Easing, ImageBackground } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ScreenOrientation from 'expo-screen-orientation';
import SplashScreen from "./components/SplashScreen";
import NetInfo from '@react-native-community/netinfo';


export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [taskImage, setTaskImage] = useState(null);

  // Fetchowanie img z API loremPicsum
  const fetchTaskImage = async (taskId) => {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      try {
        const randomParam = Math.floor(Math.random() * 1000);
        const imageUrl = `https://picsum.photos/seed/${taskId}-${randomParam}/2000/2000`;
        setTaskImage(imageUrl);
      } catch (error) {
        console.error('Error fetching image', error);
        setTaskImage(null);
      }
    } else {
      console.warn('No internet connection');
      setTaskImage(null);
    }
  };

// Animacja przesuwania panelu ustawień
  const slideAnimation = useRef(new Animated.Value(-500)).current;

// Funkcja obsługująca rotację ekranu
  useEffect(() => {
    const enableRotation = async () => {
      await ScreenOrientation.unlockAsync();
    };
    enableRotation();

    const splashTimeout = setTimeout(() => {
      setIsSplashVisible(false);
    }, 3000);

    loadTasks();

    return () => clearTimeout(splashTimeout);
  }, []);

// Wczytywanie zapisanych zadań
  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error('Failed to load tasks', error);
    }
  };

  // Zapisywanie zadań w AsyncStorage
  const saveTasks = async (updatedTasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    } catch (error) {
      console.error('Failed to save tasks', error);
    }
  };

  // Dodawanie nowych zadań
  const addTask = () => {
    if (task.trim()) {
      const newTasks = [...tasks, { id: Date.now().toString(), text: task, completed: false }];
      setTasks(newTasks);
      saveTasks(newTasks);
      setTask('');
    }
  };

  // Usuwanie zadań
  const deleteTask = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  // Toggle statusu ukończenia
  const toggleTaskCompletion = (id) => {
    const updatedTasks = tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  // Otwieranie szczegółów
  const openTaskDetails = (task) => {
    setSelectedTask(task);
    setNewTaskText(task.text);
    fetchTaskImage(task.id);
  };

// Zamykanie szczegółów
  const closeTaskDetails = () => {
    setSelectedTask(null);
    setNewTaskText('');
  };

// Zapisywanie edytowanego zadania
  const saveTask = () => {
    const updatedTasks = tasks.map((task) =>
        task.id === selectedTask.id ? { ...task, text: newTaskText } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    closeTaskDetails();
  };

  // Ustawienia toggler
  const toggleSettings = () => {
    if (!isSettingsVisible) {
      setIsSettingsVisible(true);
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnimation, {
        toValue: -500,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => setIsSettingsVisible(false));
    }
  };

  if (isSplashVisible) {
    return <SplashScreen />;
  }

  return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <Text style={styles.header}>To-Do List</Text>
            <TouchableOpacity style={styles.settingsButton} onPress={toggleSettings}>
              <Icon name="settings" size={24} color="gray" />
            </TouchableOpacity>
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
                      <TouchableOpacity onPress={() => openTaskDetails(item)} style={{ flex: 1 }}>
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

          {isSettingsVisible && <View style={styles.overlay} onTouchStart={toggleSettings} />}

          <Animated.View
              style={[
                styles.settingsPanel,
                { transform: [{ translateX: slideAnimation }] },
              ]}
          >
            <Text style={styles.settingsHeader}>Settings</Text>
            <Text style={styles.settingsText}>
              Placeholder settings panel.
            </Text>
          </Animated.View>

          {selectedTask && (
              <Modal visible={true} animationType="slide" onRequestClose={closeTaskDetails}>
                <ImageBackground
                    source={taskImage ? { uri: taskImage } : null}
                    style={styles.modalContainer}
                    resizeMode="cover"
                >
                  <View style={styles.modalOverlay}>
                    <Text style={styles.modalHeader}>Edit Task</Text>
                    <TextInput
                        style={styles.modalInput}
                        value={newTaskText}
                        onChangeText={setNewTaskText}
                        placeholder="Edit task"
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
                </ImageBackground>
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
  settingsButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  settingsPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: '#fff',
    padding: 20,
    zIndex: 10,
  },
  settingsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 30,
  },
  settingsText: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 20,
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
  },
  taskText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  modalOverlay: {
    flex: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 5,
  },
  taskImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  imagePlaceholder: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },

});

