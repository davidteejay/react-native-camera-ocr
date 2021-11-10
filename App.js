import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker'
import vision from '@react-native-firebase/ml-vision'
import * as DocumentPicker from 'expo-document-picker';

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
    const res = await DocumentPicker.getDocumentAsync({
      multiple: false,
    });
    if(res.type==='success'){
      setMedia(res)
      ocrApiExtractText(res)
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
      type: '*/*',
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
        <ScrollView>
        <Text>{result}</Text>
        </ScrollView>
        
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
