import { useContext, useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { userContext } from "../../context/UserContext";
import { Ionicons } from '@expo/vector-icons';


const Profile = ({ navigation }) => {
    const { user, setUser } = useContext(userContext);
    const handleLogout = () => {
        setUser(null)
    }

    const handleDeleteAccount = () => {
        console.log('deleted user (not actually)')
        setUser(null)
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.profileCardContainer}
                onPress={() => navigation.navigate('PersonalInformation')}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', height: 50 }}>
                    {/* profile icon placeholder */}
                    <View style={{ borderRadius: 50, width: 36, height: 36, backgroundColor: 'gray', marginRight: 10 }} />
                    <Text style={{ fontSize: 18, marginLeft: 6 }}>
                        Account Center
                    </Text>
                </View>
                <Ionicons name={'chevron-forward'} size={24} color={'black'} />
            </TouchableOpacity>


            <View style={styles.cardsContainer}>
                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={() => navigation.navigate('SavedItems')}
                >
                    <Ionicons name={'bookmark-outline'} size={24} color={'black'} style={styles.icon} />
                    <Text style={styles.cardText}>
                        Saved Listings
                    </Text>
                </TouchableOpacity>


                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={() => navigation.navigate('YourListings')}>
                    {/* TODO FIX THIS ICON, FIND SOMETHING BETTER */}
                    <Ionicons name={'business-outline'} size={24} color={'black'} style={styles.icon} />
                    <Text style={styles.cardText}>
                        Your Listings
                    </Text>
                </TouchableOpacity>


                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={() => navigation.navigate('SoldItems')}
                >
                    <Ionicons name={'cart-outline'} size={24} color={'black'} style={styles.icon} />
                    <Text style={styles.cardText}>
                        Sold Items
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={(() => navigation.navigate('Analytics'))}
                >
                    <Ionicons name={'analytics-outline'} size={24} color={'black'} style={styles.icon} />
                    <Text style={styles.cardText}>
                        Analytics
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={(() => handleLogout())}
                >
                    <Ionicons name={'exit-outline'} size={24} color={'black'} style={styles.icon} />
                    <Text style={styles.cardText}>
                        Log Out
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.profileCard}
                    onPress={(() => handleDeleteAccount())}
                >
                    <Ionicons name={'trash-outline'} size={24} color={'black'} style={styles.icon} />
                    <Text style={styles.cardText}>
                        Delete Account
                    </Text>
                </TouchableOpacity>


            </View>
        </View >
    )
}

export default Profile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center'
    },
    cardsContainer: {
        width: '90%',
        display: 'flex',
        alignItems: 'center',
    },
    profileCardContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '90%',
        marginBottom: 40,
        marginTop: 40,
        borderWidth: 1,
        borderRadius: 12,
        padding: 8,
        borderColor: '#F2F0F0',
        height: 60
    },
    cardText: {
        fontSize: 18,
    },
    profileCard: {
        width: '100%',
        height: 60,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F2F0F0',
        display: 'flex',
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'center'
    },
    icon: {
        marginLeft: 16,
        marginRight: 10
    }

})