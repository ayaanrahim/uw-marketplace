import { useContext, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView, Image, Dimensions, ActivityIndicator, TouchableWithoutFeedback, Keyboard } from "react-native";
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { colors } from "../../../colors";
import { userContext } from "../../../context/UserContext";
import { MinusCircle, PlusCircle, Scroll, UploadSimple } from "phosphor-react-native";
import CurrencyInput from 'react-native-currency-input'
import Asterisk from "../../shared/Asterisk";
import { uploadListingImage } from "../../../utils/firebaseUtils";
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';



const screenWidth = Dimensions.get('window').width;
const imageSize = 0.16 * screenWidth;

// renders the image preview
const ImagePreview = ({ uri, removePhoto }) => {
    return (
        <View style={{
            marginRight: 10,
            marginTop: -16 // this is a little jank but it works
        }}>
            <TouchableOpacity
                style={{
                    top: imageSize * 0.25,
                    right: -imageSize + imageSize * 0.25,
                    zIndex: 1
                }}
                onPress={() => removePhoto(uri)}>
                <MinusCircle weight="fill" color={colors.loginBlue} size={30} />
            </TouchableOpacity>
            <Image source={{ uri }} style={{
                width: imageSize, height: imageSize, borderRadius: 8, borderWidth: 1, borderColor: 'lightgray'
            }} />
        </View>
    )
}

// renders the little card for the tag
const TagPreview = ({ tag, removeTag }) => {
    return (
        <View style={[{
            display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: 6, paddingHorizontal: 8, borderRadius: 12, marginRight: 8,
            alignSelf: 'flex-start',
        }, styles.shadow]}>
            <Text style={{ fontFamily: 'inter', fontSize: 12, marginLeft: 2, color: '#7E7E7E' }}>
                {tag}
            </Text>
            <TouchableOpacity onPress={() => removeTag(tag)}>
                <Ionicons name="close-outline" size={24} />
            </TouchableOpacity>
        </View>
    )
}


const CreateListing = ({ navigation }) => {
    const [photos, setPhotos] = useState([]) // array of photo uris
    const [tags, setTags] = useState([]) // array of tags
    const [title, setTitle] = useState('')
    const [price, setPrice] = useState(undefined)
    const [description, setDescription] = useState('')
    const [tagInput, setTagInput] = useState('')

    const [errorMessage, setErrorMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingPhotoPicker, setIsLoadingPhotoPicker] = useState(false)
    const [imageErrorMessage, setImageErrorMessage] = useState('')
    const { user, userData, setUserListings } = useContext(userContext)

    const handleAddTag = async (newTag) => {
        if (newTag.trim().length === 0) {
            return;
        }
        if (newTag.length <= 15) {
            setTags([...tags, newTag])
            setTagInput('')
        }
    }

    const removeTag = async (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove))
    }

    // this will use the expo photo picker library to pick a photo from the user
    // we have the permissions in our plist file (under app.json)
    // we also prompt permissions from them :)
    const handleAddPhoto = async () => {
        setImageErrorMessage('')
        try {
            setIsLoadingPhotoPicker(true)
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('We need camera roll permissions to add photos!');
                return;
            }
            // Launch image picker
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images, // Updated line
                allowsMultipleSelection: true,
                quality: 0.7,
                selectionLimit: Math.max(0, 5 - photos.length), // prevent negatives
            });

            if (!result.canceled) {
                const selectedImages = result.assets.map(asset => ({
                    uri: asset.uri,
                }));
                setPhotos([...photos, ...selectedImages.map(img => img.uri)]);
                setIsLoadingPhotoPicker(false)
            } else {
                // user cancelled
                setIsLoadingPhotoPicker(false)
            }
        } catch (e) {
            console.log(e);
            setImageErrorMessage('Failed to read  image')
            setIsLoadingPhotoPicker(false)
        } finally {

            setIsLoadingPhotoPicker(false)
        }
    };

    const removePhoto = (uri) => {
        setPhotos(photos.filter(photoURI => photoURI !== uri));
        // no backend update needed
    };

    const handlePublish = async () => {
        // TODO add some confetti or some fun animation or something
        if (!title) {
            setErrorMessage('Enter a title!')
            return
        }
        if (title.length > 100) {
            setErrorMessage('Enter a shorter title!')
            return
        }

        if (!price) {
            setErrorMessage('Enter a price!')
            return
        }
        // if price is invalid

        if (description.length > 163) {
            setErrorMessage('Description length must be under 163 characters!')
            return
        }

        // this should not happen
        if (tags.length > 3 || photos.length > 5) {
            setErrorMessage('Too many tags or photos!')
            return;
        }
        // allow empty description
        if (photos.length === 0) {
            setErrorMessage('Enter photo(s)!')
            return;
        }

        setIsLoading(true)
        try {
            const db = getFirestore();

            // 1. make a doc ref w id (w/o setting data)
            const listingsCollectionRef = collection(db, "listings");
            const newListingRef = doc(listingsCollectionRef); // this makes an ID
            const listingID = newListingRef.id;


            // 2. upload all the images
            // making sure to await
            const uniquePhotos = [...new Set(photos)];
            const uploadPromises = uniquePhotos.map(async (uri, index) => {
                // this -index is what allows for no duplicates within an upload
                // we use date as an identifier in our path as well
                return uploadListingImage(uri, user.uid, listingID, index)
            });
            const downloadURLs = await Promise.all(uploadPromises);

            // 3. prepare data listing
            const listingData = {
                title,
                price,
                description,
                tags,
                photos: downloadURLs,
                userId: user.uid,
                userName: userData.name,
                userEmail: userData.email,
                userPfp: userData.pfp,
                sold: false,
                createdAt: new Date()
            }

            // 4. backend udpate
            await setDoc(newListingRef, listingData)

            // 5. frontend update
            const updatedListingData = {
                ...listingData,
                id: listingID,
            };
            setUserListings((prevUserListings) => [...prevUserListings, updatedListingData]);

            // 6. post completed message
            // can we use something like chakraUI toast?
            navigation.reset({
                index: 0,
                routes: [{ name: 'Marketplace' }],
            });
        } catch (e) {
            setErrorMessage(e.message)
            console.log(e);
        } finally {
            setIsLoading(false)
        }
    }

    return (
        // TODO make the KAV work
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView >
                    <View
                        style={styles.container}
                    >
                        {/* photos */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.titleText}>
                                Upload images
                                <Asterisk />
                            </Text>
                            {/* empty photos */}
                            {photos.length === 0 && <TouchableOpacity
                                onPress={handleAddPhoto}
                                style={[styles.shadow, styles.addPhotosContainer]}
                            >
                                <View style={{ display: 'flex', flexDirection: 'row', }}>
                                    {isLoadingPhotoPicker ? <ActivityIndicator /> : <UploadSimple size={30} color={colors.accentGray} />}
                                </View>
                            </TouchableOpacity>}

                            {/* photo preview and + icon */}
                            {photos.length >= 1 && <View style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                                {photos.map((uri, index) => {
                                    return (
                                        <ImagePreview key={index} uri={uri} removePhoto={removePhoto} />
                                    )
                                })}

                                {photos.length !== 5 && <TouchableOpacity
                                    onPress={handleAddPhoto}
                                    style={{ width: imageSize, height: imageSize, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 7, }}
                                    hitSlop={16}
                                >
                                    {isLoadingPhotoPicker ? <ActivityIndicator /> : <PlusCircle size={30} color={colors.loginBlue} />}
                                </TouchableOpacity>}
                            </View>}

                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.footerText}>
                                    Photos | {photos.length}/5
                                </Text>
                                <Text style={{ color: colors.errorMessage }}>
                                    {imageErrorMessage}
                                </Text>
                            </View>
                        </View>

                        {/* title */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.titleText}>
                                Title
                                <Asterisk />
                            </Text>
                            <TextInput
                                style={[styles.shadow, styles.middleInput]}
                                placeholder="Title"
                                placeholderTextColor="#7E7E7E"
                                value={title}
                                onChangeText={(text) => {
                                    setTitle(text)
                                    setErrorMessage('')
                                    setImageErrorMessage('')
                                }}
                            />
                        </View>

                        <View style={[styles.inputContainer]}>
                            <Text style={styles.titleText}>
                                Price
                                <Asterisk />
                            </Text>
                            <CurrencyInput
                                style={[styles.shadow, styles.middleInput, { padding: 10 }]}
                                value={price}
                                onChangeValue={(text) => {
                                    setPrice(text)
                                    setErrorMessage('')
                                    setImageErrorMessage('')
                                }}
                                delimiter=","
                                separator="." // otherwise they use ,
                                precision={2}
                                minValue={0}
                                prefix='$'
                                placeholder="$1.63"
                            />
                            {/* <TextInput
                        style={[styles.shadow, styles.middleInput]}
                        placeholder="0.00"
                        placeholderTextColor="#7E7E7E"
                        value={price}
                        onChangeText={handlePriceChange}
                        keyboardType="numeric"
                    /> */}
                        </View>


                        {/* Tags input container */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.titleText}>
                                Tags | {tags.length}/3
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                {tags.length < 3 && <TextInput
                                    style={[styles.shadow, styles.tagInput]}
                                    placeholder="Clothing"
                                    placeholderTextColor="#7E7E7E"
                                    value={tagInput}
                                    onChangeText={(text) => {
                                        setTagInput(text)
                                        setErrorMessage('')
                                        setImageErrorMessage('')
                                    }}
                                />}
                                {tags.length < 3 && <TouchableOpacity
                                    onPress={() => handleAddTag(tagInput)}
                                    style={{ marginLeft: 10 }}
                                    disabled={tagInput.length === 0}
                                >
                                    <PlusCircle color={tagInput.length > 0 && tagInput.length <= 15 ? colors.loginBlue : colors.accentGray} size={30} />
                                </TouchableOpacity>}
                            </View>

                            {/* tag previews */}
                            <View style={{ display: 'flex', flexDirection: 'row', marginTop: 5 }}>
                                {tags.map((tag, index) => {
                                    return (
                                        <TagPreview key={index} tag={tag} removeTag={removeTag} />
                                    )
                                })}
                            </View>

                            {/* capping the legnth of tags at 15 characters */}
                            <Text style={[styles.footerText, { marginBottom: 0, color: colors.accentGray }, tagInput.length > 15 && { color: colors.errorMessage }]}>
                                {tagInput.length}/15 characters
                            </Text>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.titleText}>
                                Description
                                <Asterisk />
                            </Text>
                            <TextInput
                                style={[styles.shadow, styles.descriptionInput]}
                                placeholder="Description"
                                placeholderTextColor="#7E7E7E"
                                value={description}
                                onChangeText={(text) => {
                                    setDescription(text)
                                    setErrorMessage('')
                                    setImageErrorMessage('')
                                }}
                                multiline={true}
                            />
                            <Text style={[styles.footerText, { marginBottom: 0, color: '#7E7E7E' }, description.length > 163 && { color: 'red' }]}>
                                {description.length}/163 characters
                            </Text>
                        </View>

                        <View style={styles.errorContainer}>
                            {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
                        </View>

                        <TouchableOpacity
                            onPress={() => handlePublish()}
                            style={[styles.publishButton, styles.publishShadow, errorMessage && { borderWidth: 1, borderColor: 'red' }, title && price && photos.length > 0 && styles.publishButtonReady]}
                        >

                            {!isLoading ? <Text style={[title && price && photos.length > 0 ? { fontSize: 20, color: 'white', fontFamily: 'inter', } : styles.placeholderText, { fontWeight: '600' }]}
                            >
                                Publish
                            </Text> : <ActivityIndicator color='white' />}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView >
    )
}

export default CreateListing;

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        alignSelf: 'center',
        width: '100%',
        height: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 0,
        paddingHorizontal: 25,
        paddingVertical: 15
    },
    titleText: {
        fontSize: 18,
        fontFamily: 'inter',
        color: colors.loginBlue,
        marginBottom: 6,
        marginLeft: 6
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'flex-start',
    },
    shadow: {
        shadowColor: colors.accentGray,
        shadowOffset: {
            top: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 8,
    },
    addPhotosContainer: {
        backgroundColor: 'white',
        // height: imageSize,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        marginTop: 1,
        height: 65,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: colors.accentGray
    },
    placeholderText: {
        color: '#7E7E7E',
        fontFamily: 'inter',
        fontSize: 16
    },
    middleInput: {
        width: '100%',
        height: 36,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 15,
    },
    middleInputContainer: {
        width: '100%',
        height: 280,
        justifyContent: 'space-between',
        marginTop: 20
    },
    descriptionInput: {
        width: '100%',
        height: 90,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 15,
        paddingVertical: 12,
    },
    footerText: {
        fontSize: 14,
        color: colors.accentGray,
        fontFamily: 'inter',
        alignSelf: 'flex-start',
        marginTop: 6
    },
    publishButton: {
        width: '100%',
        height: 45,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 25,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 35,
    },
    publishButtonReady: {
        backgroundColor: colors.neonBlue,
    },
    errorContainer: {
        width: '100%',
        height: 30,
        marginTop: 12,
        marginLeft: 12
    },
    errorText: {
        fontSize: 16,
        color: 'red',
        fontFamily: 'inter'
    },
    // scrollContent: {
    //     justifyContent: 'flex-start',
    //     alignItems: 'center',
    // },
    inputContainer: {
        marginBottom: 20,
        width: '100%'
    },
    tagInput: {
        width: '50%',
        height: 36,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 15,
    },
    publishShadow: {
        shadowColor: colors.loginBlue,
        shadowOffset: {
            top: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    }

})