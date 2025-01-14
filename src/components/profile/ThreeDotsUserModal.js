import { StyleSheet, TouchableWithoutFeedback, View, Text, TouchableOpacity } from "react-native"
import { colors } from "../../constants/colors"

export function ThreeDotsUserModal({
   visible,
   onReport,
   onClose
}) {
    if (!visible) {
        return null
    }
    return (
        <TouchableWithoutFeedback
            style={styles.modalBackdrop}
            onPress={onClose} // Dismiss modal on backdrop press
        >
            <View style={styles.modalContainer}>
                <TouchableOpacity style={[styles.modalOption, { borderBottomWidth: 0 }]} onPress={onReport}>
                    <Text style={[styles.modalText, { color: 'red' }]}>Report User</Text>
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback >
    )
}


const styles = StyleSheet.create({
    modalContainer: {
        position: 'absolute',
        top: 30, // Adjust to position the modal just below the header
        right: 10, // Align with the three dots
        width: 150,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        paddingVertical: 4,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    modalOption: {
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.loginGray,
    },
    modalText: {
        fontSize: 16,
        textAlign: 'center',
    },
})