import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ScreenOrientation from 'expo-screen-orientation';
import SplashScreen from "./components/SplashScreen";
import { Picker } from "@react-native-picker/picker";

export default function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [isSettingsVisible, setIsSettingsVisible] = useState(false); // Side panel visibility

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

  const addTask = () => {
    if (task.trim()) {
      setTasks([...tasks, { id: Date.now().toString(), text: task, completed: false }]);
      setTask('');
    }
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const toggleTaskCompletion = (id) => {
    setTasks(
        tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
        )
    );
  };

  const openTaskDetails = (task) => {
    setSelectedTask(task);
    setNewTaskText(task.text);
  };

  const closeTaskDetails = () => {
    setSelectedTask(null);
    setNewTaskText('');
  };

  const saveTask = () => {
    setTasks(
        tasks.map((task) =>
            task.id === selectedTask.id ? { ...task, text: newTaskText } : task
        )
    );
    closeTaskDetails();
  };

  const toggleSettings = () => {
    setIsSettingsVisible(!isSettingsVisible);
  };

  if (isSplashVisible) {
    return <SplashScreen />;
  }

  return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <View style={[styles.container]}>
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

          {/* Przyciemnienie dla tła modala ustawień */}
          {isSettingsVisible && <View style={styles.overlay} onTouchStart={toggleSettings} h></View>}

          {/* Modal ustwień */}
          {isSettingsVisible && (
              <View style={styles.settingsPanel}>
                <Text style={styles.settingsHeader}>Settings</Text>
                <Text style={styles.settingsText}>This view needs to exist but I have no idea what to put here so it's just a placeholder :></Text>
              </View>
          )}

          {/* Modal for task editing */}
          {selectedTask && (
              <Modal visible={true} animationType="slide" onRequestClose={closeTaskDetails}>
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
    marginTop: 30
  },
  settingsText: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 20
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 5,
  }
});
