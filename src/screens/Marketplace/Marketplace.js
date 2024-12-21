import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { getFirestore, where, setDoc, collection, query, orderBy, getDocs, limit, startAfter } from "firebase/firestore";

import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../colors'
import { useEffect, useState } from "react";

import ListingCard from '../../components/ListingCard'
import ForYou from './MarketplaceLists/ForYou'
import Friends from './MarketplaceLists/Friends'
import Sell from './MarketplaceLists/Sell'
import Search from './MarketplaceLists/Search'
import { Eyeglasses, MagnifyingGlass, MapPin, Plus } from "phosphor-react-native";
import ListingsListSkeletonLoaderFull from "../../components/ListingsListSkeletonLoaderFull";
import { useFocusEffect } from "@react-navigation/native";


// how many items we fetch at a time
// this is obviously terrible but makes it easy to see lol
const PAGE_SIZE = 10;

const Marketplace = ({ navigation }) => {
    // TODO refactor for clarity
    const totalUsers = '2.3k' // grab the total rows from the users DB and cache it

    const [listings, setListings] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // possible options are foryou, friends, sell, search
    const [selectedOption, setSelectedOption] = useState('foryou')

    // for listingsList component pagination:
    const [refreshing, setRefreshing] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)
    const [lastDoc, setLastDoc] = useState(null) // allow us to track from the last doc

    const db = getFirestore();

    // this is bad
    useFocusEffect(() => {
        fetchListings(true);
    }) // db shouldnt change but just in case


    // moved outside of the use effect hook so that we can call this elsewhere
    const fetchListings = async (refresh = false) => {
        if (refresh) {
            setRefreshing(true)
            setLastDoc(null)
        } else if (listings.length === 0) {
            // then this is an initial load
            setIsLoading(true)
        } else {
            // we are loading more
            setLoadingMore(true)
        }

        try {
            let q = query(
                collection(db, "listings"),
                where("sold", "==", false),
                orderBy("createdAt", "desc"), // most recent first
                limit(PAGE_SIZE));

            // if we have a lastdoc and arent refreshing, we are grabbing more
            // so we change our query to start from there
            if (lastDoc && !refresh) {
                q = query(q, startAfter(lastDoc))
            }

            const querySnapshot = await getDocs(q);
            const listingsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // store the last doc so that we can keep it for pagination
            // if not present, then we just make it as null
            const newLastDoc = querySnapshot.docs.length > 0 ? querySnapshot.docs[querySnapshot.docs.length - 1] : null

            if (refresh) {
                setListings(listingsData);
            } else {
                setListings(prev => [...prev, ...listingsData])
            }

            setLastDoc(newLastDoc)
        } catch (error) {
            console.error("Error fetching listings:", error);
        } finally {
            setIsLoading(false);
            if (refresh) {
                setRefreshing(false)
            }
        }
    };

    const onRefresh = () => {
        fetchListings(true)
    }

    // method for if we hit the bottom
    const onLoadMore = async () => {
        // avoid duplicate requests
        if (loadingMore || refreshing || !lastDoc) {
            return;
        }
        setLoadingMore(true)
        await fetchListings(false)
        setLoadingMore(false)
    }

    const renderSelectedOption = () => {
        switch (selectedOption) {
            case 'foryou':
                return <ForYou
                    listings={listings}
                    navigation={navigation}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    onLoadMore={onLoadMore}
                    loadingMore={loadingMore}
                />
            case 'friends':
                return <Friends navigation={navigation} />
            case 'sell':
                return <Sell activeListings={listings} navigation={navigation} />
            // case 'search':
            //     return <Search navigation={navigation} />
            default:
                return <Text>Oops! Option not found.</Text>
        }
    }



    return (
        <View style={styles.container}>
            <View style={styles.topBarContainer}>

                <View style={styles.topBarLeft}>
                    {/* for you */}
                    <TouchableOpacity style={[
                        styles.titleContainer,
                        selectedOption === 'foryou' && styles.selectedTitle
                    ]}
                        onPress={() => setSelectedOption('foryou')}

                    >
                        <Text style={[styles.titleText, { color: selectedOption === "foryou" ? 'black' : colors.accentGray }]} >
                            For you
                        </Text>
                    </TouchableOpacity>

                    {/* friends */}
                    <TouchableOpacity style={[
                        styles.titleContainer,
                        selectedOption === 'friends' && styles.selectedTitle
                    ]}
                        onPress={() => setSelectedOption('friends')}
                    >

                        <Text style={[styles.titleText, { color: selectedOption === "friends" ? 'black' : colors.accentGray }]}>
                            Friends
                        </Text>
                    </TouchableOpacity>

                    {/* sell */}
                    <TouchableOpacity style={[
                        styles.titleContainer,
                        selectedOption === 'sell' && styles.selectedTitle
                    ]}
                        onPress={() => setSelectedOption('sell')}
                    >
                        <Text style={[styles.titleText, { color: selectedOption === "sell" ? 'black' : colors.accentGray }]}>
                            Sell
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Search')}
                >
                    <MagnifyingGlass />
                </TouchableOpacity>
            </View>


            {/* college header */}
            {selectedOption !== 'sell' && selectedOption !== 'search' && <View style={styles.collegeHeaderContainer}>

                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ marginRight: 8, }}>
                        <MapPin size={24} weight={'fill'} color={colors.uwPurple} />

                    </View>

                    <Text style={[styles.tabTextStyle, { color: colors.uwPurple }]}>University of Washington</Text>
                </View>
                <Text style={{ color: colors.darkgray, fontSize: 14, fontFamily: 'inter' }}>{totalUsers} users</Text>
            </View>
            }

            {isLoading ? (<ListingsListSkeletonLoaderFull />) : renderSelectedOption()}

            <TouchableOpacity onPress={() => navigation.navigate('CreateListing')}

                style={{ backgroundColor: 'white', borderColor: colors.darkblue, width: 60, height: 60, borderRadius: 50, display: 'flex', justifyContent: 'center', alignItems: 'center', shadowColor: colors.neonBlue, shadowOpacity: 0.35, shadowRadius: 5, position: 'absolute', bottom: 15, right: 15, shadowOffset: { top: 0, bottom: 0, left: 0, right: 0 } }}>
                <Plus color={colors.darkblue} size={30} weight="bold" />
            </TouchableOpacity>
        </View>
    )
}

export default Marketplace

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: '100%',
        width: '100%',
    },
    collegeHeaderContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '90%',
        flexDirection: 'row',
        marginBottom: 12,
        marginTop: 12,
    },
    iconPlaceholder: {
        width: 30,
        height: 30,
        backgroundColor: 'black'
    },
    tabTextStyle: {
        fontSize: 18,
        fontFamily: 'inter',
    },

    shadow: {
        shadowColor: colors.loginBlue,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
        paddingHorizontal: 16,

    },
    topTitle: {
        backgroundColor: 'white',
        height: 36,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15
    },
    topBarContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 40,
        paddingLeft: 20,
        paddingRight: 16,
        marginTop: 4,
        marginBottom: 16,
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: colors.loginGray
    },
    topBarLeft: {
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        width: '75%',
        height: '100%',
        alignItems: 'center'
    },
    titleContainer: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15,
        position: 'relative'
    },
    selectedTitle: {
        borderBottomWidth: 1,
        borderBottomColor: 'black'
    },
    titleText: {
        fontSize: 16,
        fontFamily: 'inter',
        fontWeight: '500',
        textAlign: 'center'
    }

})