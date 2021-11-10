import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker'
import vision from '@react-native-firebase/ml-vision'
import DocumentPicker from 'react-native-document-picker';

export default function App() {
  const camera = useRef()
  const [text, setText] = useState(null)
  const [result, setResult] = useState("")
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
        ocrApiExtractText(media)
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
        ocrApiExtractText(media)
      }
    }
  }

  const pickFile = async () => {
    console.log('pick file')
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.pdf],
      });
      console.log('res : ' + JSON.stringify(res));
      // Setting the state to show single file attributes
      setMedia(res);
    } catch (err) {
      setSingleFile(null);
      // Handling any exception (If any)
      if (DocumentPicker.isCancel(err)) {
        // If user canceled the document selection
        alert('Canceled');
      } else {
        // For Unknown Error
        alert('Unknown Error: ' + JSON.stringify(err));
        throw err;
      }
    }
  }

  const recognizeText = async (media) => {
    console.log({ media })

    const processingResult = await vision().cloudDocumentTextRecognizerProcessImage(media.uri)
    console.log({ processingResult })
  }

  const ocrApiExtractText = (media) => {
    const formData = new FormData()
    formData.append('doc', {
      name: media.uri.split('/').pop(),
      uri: media.uri,
      type: 'image/*',
    })
  
    fetch('https://api.ocr.prunedge.org/extract-text/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data'
    },
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      console.log(data)
      setResult(data?.text ?? "No result")
    })
    .catch(error => {
      console.error(error)
    })
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
          onPress={pickFile}
        >
          <Text>Pick Image</Text>
        </TouchableOpacity>
        <Text>Result</Text>
        <Text>{result}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding:25
  },
});
