import { View, Text, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { colors } from '../constants/colors'
import { MapPin } from 'phosphor-react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { collection, getCountFromServer, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebaseConfig'
import { formatDate } from '../utils/formatDate'

const CACHE_KEY = 'uw_user_count'
const CACHE_EXPIRY = 2 * 60 * 60 * 1000; // 2 hours

export default function UWHeader() {
    const [userCount, setUserCount] = useState('--')

    const formatNumber = (num) => {
        if (num < 0) {
            throw new Error('number of users must be positive')
        }
        if (num > 1000000) {
            return `${(num / 1000000).toFixed(1)} m`
        } else if (num >= 1000) { // in the thousands
            return `${(num / 1000).toFixed(1)} k`
        } else { // under 1k, we can fit all of them
            return num
        }
    }

    useEffect(() => {
        const fetchAndCache = async () => {
            try {
                // try to grab from async
                // if not in async, then just fetch from the firebase DB
                const cachedData = await AsyncStorage.getItem(CACHE_KEY)
                if (cachedData) {
                    const { count, timestamp } = JSON.parse(cachedData)

                    // check if the data time is still within the cache expiry
                    if (Date.now() - timestamp < CACHE_EXPIRY) {
                        setUserCount(formatNumber(count))
                        return
                    }
                }

                // grab COUNT from DB
                // not grabbing all of the user docs
                const usersRef = collection(db, 'users')
                const uwQuery = query(usersRef)
                const snapshot = await getCountFromServer(uwQuery)
                const size = snapshot.data().count
                const cacheData = {
                    count: size,
                    timestamp: Date.now()
                }

                // set async with updated and set the user count accordingly
                await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
                setUserCount(formatNumber(cacheData.count))

            } catch (e) {
                console.error(e)
                setUserCount('---')
            }
        }
        fetchAndCache()
    }, [])


    return (
        <View style={styles.collegeHeaderContainer}>

            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ marginRight: 8, }}>
                    <MapPin size={20} weight={'fill'} color={colors.uwPurple} />

                </View>

                <Text style={[styles.tabTextStyle, { color: colors.uwPurple }]}>University of Washington</Text>
            </View>
            <Text style={{ color: colors.darkgray, fontSize: 14, fontFamily: 'inter' }}>{userCount} users</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    collegeHeaderContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        flexDirection: 'row',
        padding: 10,
    },
    iconPlaceholder: {
        width: 30,
        height: 30,
        backgroundColor: 'black'
    },
    tabTextStyle: {
        fontSize: 16,
        fontFamily: 'inter',
        fontWeight: '500'
    },
})