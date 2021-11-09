import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker'
import vision from '@react-native-firebase/ml-vision'

export default function App() {
  const camera = useRef()
  const [text, setText] = useState(null)
  const [media, setMedia] = useState(null)

  const takeImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()

    if (status === 'granted') {
      const media = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      })

      if (!media.cancelled) {
        setMedia(media)
        recognizeText(media)
      }
    }
  }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status === 'granted') {
      const media = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      })

      if (!media.cancelled) {
        setMedia(media)
        recognizeText(media)
      }
    }
  }

  const recognizeText = async (media) => {
    console.log({ media })

    const processingResult = await vision().cloudDocumentTextRecognizerProcessImage(media.uri)
    console.log({ processingResult })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <TouchableOpacity
          style={{ alignSelf: 'center', paddingVertical: 20 }}
          onPress={takeImage}
        >
          <Text>Take Image</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ alignSelf: 'center', paddingVertical: 20 }}
          onPress={pickImage}
        >
          <Text>Pick Image</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
});
