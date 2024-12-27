import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function SplashScreen() {
    return (
        <View style={styles.splashContainer}>
            <Icon name="check-circle" size={50} color="#fff" style={styles.icon} />
            <Text style={styles.splashText}>Welcome to To-Do List</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    splashContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#007bff',
    },
    splashText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    icon: {
        marginBottom: 10
    },
});
