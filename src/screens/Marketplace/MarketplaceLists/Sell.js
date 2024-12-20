import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import ListingCard from "../../../components/ListingCard"
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ListingsList from "../../../components/ListingsList";
import { colors } from "../../../colors";
import { useCallback, useContext, useEffect, useState } from "react";
import { userContext } from "../../../context/UserContext";
import { useFocusEffect } from "@react-navigation/native";


const Sell = ({ navigation }) => {
    const { userListings } = useContext(userContext)
    const [activeListings, setActiveListings] = useState([])

    useFocusEffect(
        useCallback(() => {
            setActiveListings(userListings.filter((listing) => listing.sold !== true))


            // empty cleanup function
            return () => {

            };
        }, [userListings])
    );




    return (
        <View style={styles.container}>

            <TouchableOpacity onPress={() => navigation.navigate('CreateListing')}
                style={[styles.shadow, styles.topTitle]}>
                <Text style={{ fontFamily: 'inter', fontSize: 16 }}>
                    Create listing
                </Text>
            </TouchableOpacity>

            {activeListings?.length > 0 ? <ListingsList navigation={navigation} listings={activeListings} /> : (
                <View style={styles.textContainer}>
                    <Text style={{ fontSize: 16, fontFamily: 'inter', fontWeight: '600', marginBottom: 10 }}>
                        Ready to sell?
                    </Text>
                    <Text style={{ fontFamily: 'inter', fontSize: 16, textAlign: 'center' }}>
                        Your listings will appear here after your first post.
                    </Text>
                </View>
            )}
        </View>
    )
}

export default Sell

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '94%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignSelf: 'center',
    },
    shadow: {
        shadowColor: colors.loginBlue,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 8,
    },
    topTitle: {
        backgroundColor: 'white',
        height: 36,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        marginBottom: 12
    },
    textContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '70%',
        width: '70%',
        alignSelf: 'center'
    }
})