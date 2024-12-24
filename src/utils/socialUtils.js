import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking'
import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';
import { db } from '../../firebaseConfig';
import { arrayRemove, doc, getDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const sendProfile = (userID) => {
    if (!userID) {
        return
    }
    const profileLink = Linking.createURL(`user/${userID}`)
    const messageBody = `Follow me on Ripple!\n${profileLink}`
    const smsURL = `sms:&body=${encodeURIComponent(messageBody)}`

    try {
        Linking.openURL(smsURL)
    } catch (e) {
        console.error(e)
        throw e
    }
    // example dev URL: exp://10.155.102.135:8081/--/user/RsYuNgUxSUTm0xdD0CMi6Yhkjc73 
    // prod urls will look different, testflight urls look different, etc.
    // we will need to use firebase dynamic URLs so that people without the app will be prompted to go download
}

export const copyLink = async (link) => {
    Clipboard.setStringAsync(link);
}

// export const handleRemoveFollower = async (activeUser, otherUserID, isFollowers, setActiveModalId, setUsers, setUser, showToast) => {
//     try {
//         if (!activeUser?.uid || !otherUserID) {
//             console.error("activeUser or otherUserID is undefined");
//             showToast("Something went wrong. Please try again.");
//             return;
//         }

//         const activeUserRef = doc(db, "users", activeUser.uid);
//         const otherUserRef = doc(db, "users", otherUserID);

//         // Fetch user documents
//         const activeUserDoc = await getDoc(activeUserRef);
//         const otherUserDoc = await getDoc(otherUserRef);

//         if (!activeUserDoc.exists()) {
//             console.error("Active user document does not exist");
//             showToast("Active user not found.");
//             return;
//         }

//         if (!otherUserDoc.exists()) {
//             console.error("Other user document does not exist");
//             showToast("User not found.");
//             return;
//         }

//         // Update Firestore data based on isFollowers flag
//         if (isFollowers) {
//             const updatedFollowers = activeUserDoc.data().followers.filter(
//                 follower => follower.follower_id !== otherUserID
//             );

//             // firebase
//             await updateDoc(activeUserRef, { followers: updatedFollowers });

//             // followers state
//             setUser(prevUser => ({
//                 ...prevUser,
//                 followers: updatedFollowers
//             }));

//             // update async storage
//             await Promise.all([
//                 AsyncStorage.setItem('userFollowers', JSON.stringify(updatedFollowers)),
//                 AsyncStorage.setItem('userData', JSON.stringify({
//                     ...currentUserData,
//                     followers: updatedFollowers
//                 }))
//             ]);
//             // userContext
//             setUsers(prevUsers =>
//                 prevUsers.filter(u => u.follower_id !== otherUserID)
//             );
//         } else {
//             const updatedFollowing = activeUserDoc.data().following.filter(
//                 following => following.following_id !== otherUserID
//             );


//             await updateDoc(activeUserRef, { following: updatedFollowing });

//             setUser(prevUser => ({
//                 ...prevUser,
//                 following: updatedFollowing
//             }));

//             await Promise.all([
//                 AsyncStorage.setItem('userFollowing', JSON.stringify(updatedFollowing)),
//                 AsyncStorage.setItem('userFollowingIds', JSON.stringify(updatedFollowingIds)),
//                 AsyncStorage.setItem('userData', JSON.stringify({
//                     ...currentUserData,
//                     following: updatedFollowing
//                 }))
//             ]);

//             setUsers(prevUsers =>
//                 prevUsers.filter(u => u.following_id !== otherUserID)
//             );
//         };

//         // Show success toast
//         showToast(isFollowers ? "Removed Follower!" : "Unfollowed User!");
//     } catch (e) {
//         console.error("Error in handleRemoveFollower:", {
//             activeUser,
//             otherUserID,
//             isFollowers,
//             error: e,
//         });
//         showToast("Error removing user!");
//     } finally {
//         // Close the modal
//         setActiveModalId(null);
//     }
// };


export const handleRemoveFollower = async (
    activeUser,
    otherUserID,
    isFollowers,
    setActiveModalId,
    setUsers,
    setUser,
    showToast,
    setUserData,
    setUserFollowers,
    setUserFollowing,
    setUserFollowingIds
) => {
    try {
        if (!activeUser?.uid || !otherUserID) {
            console.error("activeUser or otherUserID is undefined");
            showToast("Something went wrong. Please try again.");
            return;
        }

        const activeUserRef = doc(db, "users", activeUser.uid);
        const otherUserRef = doc(db, "users", otherUserID);

        // Fetch user documents
        const activeUserDoc = await getDoc(activeUserRef);
        const otherUserDoc = await getDoc(otherUserRef);

        if (!activeUserDoc.exists() || !otherUserDoc.exists()) {
            console.error("One or more user documents do not exist");
            showToast("User not found.");
            return;
        }

        // Get the current user's data once to avoid repeated calls
        const currentUserData = activeUserDoc.data();

        if (isFollowers) {
            // Handle removing a follower
            const updatedFollowers = (currentUserData.followers || []).filter(
                follower => follower.follower_id !== otherUserID
            );

            // Update Firestore first
            await updateDoc(activeUserRef, { followers: updatedFollowers });

            // Then update all our local state
            setUserData(prevData => ({
                ...prevData,
                followers: updatedFollowers
            }));

            setUserFollowers(updatedFollowers);

            setUser(prevUser => ({
                ...prevUser,
                followers: updatedFollowers
            }));

            // Finally update AsyncStorage
            await AsyncStorage.setItem('userFollowers', JSON.stringify(updatedFollowers));

            // Update the UI list
            setUsers(prevUsers => prevUsers.filter(u => u.follower_id !== otherUserID));

        } else {
            // Handle unfollowing someone
            // First get the current following array with a fallback to empty array
            const currentFollowing = currentUserData.following || [];

            // Create our updated arrays
            const updatedFollowing = currentFollowing.filter(
                following => following.following_id !== otherUserID
            );

            // Extract just the IDs from the updated following array
            const newFollowingIds = updatedFollowing.map(item => item.following_id);

            // Update Firestore first
            await updateDoc(activeUserRef, { following: updatedFollowing });

            // Then update all our local state atomically
            setUserData(prevData => ({
                ...prevData,
                following: updatedFollowing
            }));

            setUserFollowing(updatedFollowing);
            setUserFollowingIds(newFollowingIds);

            setUser(prevUser => ({
                ...prevUser,
                following: updatedFollowing
            }));

            // Update AsyncStorage
            await Promise.all([
                AsyncStorage.setItem('userFollowing', JSON.stringify(updatedFollowing)),
                AsyncStorage.setItem('userFollowingIds', JSON.stringify(newFollowingIds))
            ]);

            // Update the UI list
            setUsers(prevUsers => prevUsers.filter(u => u.following_id !== otherUserID));
        }

        // Show success message
        showToast(isFollowers ? "Removed Follower!" : "Unfollowed User!");
    } catch (e) {
        console.error("Error in handleRemoveFollower:", {
            activeUser,
            otherUserID,
            isFollowers,
            error: e,
        });
        showToast("Error removing user!");
    } finally {
        setActiveModalId(null);
    }
};