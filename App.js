import { ImageBackground, ScrollView, StyleSheet, Text, TouchableHighlight, View, Button, Modal, TextInput, Animated, Easing } from 'react-native';
import { useState, useEffect, useCallback, useRef } from 'react';

export default function App() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [ids, setIds] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    const response = await fetch('https://picsum.photos/v2/list?page=1&limit=4');
    const data = await response.json();
    setTimeout(() => {
      setImages((prevImages) => [...prevImages, ...data]);
      setLoading(false);
    }, 3000);
  };

  const removeImage = useCallback(
    (id) => {
      setDeleting(true);
      setIds(id);
      setTimeout(() => {
        setImages((prevState) => prevState.filter((image) => image.id !== id));
        setDeleting(false);
      }, 3000);
    },
    [setDeleting, setImages]
  );

  const addNewImage = () => {
    if (newImageUrl) {
      const newImage = {
        id: Math.random().toString(),
        download_url: newImageUrl,
      };
      setImages((prevImages) => [newImage, ...prevImages]);
      setModalVisible(false);
      setNewImageUrl('');
    }
  };

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1.5,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0.5,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();
  }, [spinValue, scaleValue, opacityValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const Loader = () => (
    <Animated.View
      style={[
        styles.loader,
        {
          transform: [{ rotate: spin }, { scale: scaleValue }],
          opacity: opacityValue,
        },
      ]}
    >
      <Text style={styles.loaderText}>◉</Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Button title="Добавить изображение" onPress={() => setModalVisible(true)} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <TextInput
              style={styles.input}
              placeholder="Введите URL изображения"
              value={newImageUrl}
              onChangeText={setNewImageUrl}
            />
            <Button title="Добавить" onPress={addNewImage} />
            <Button title="Отмена" onPress={() => setModalVisible(false)} color="red" />
          </View>
        </View>
      </Modal>

      {loading && images.length === 0 ? (
        <Loader />
      ) : (
        <ScrollView contentContainerStyle={{ alignItems: 'center' }}>
          {images.map((image) => (
            <TouchableHighlight
              onLongPress={() => removeImage(image.id)}
              key={image.id}
              underlayColor="#DDDDDD"
            >
              <View>
                <ImageBackground source={{ uri: image.download_url }} style={styles.image}>
                  <Text style={styles.imageIdText}>ID: {image.id}</Text>
                  {deleting && ids === image.id && <Loader />}
                </ImageBackground>
              </View>
            </TouchableHighlight>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIdText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  loader: {
    marginTop: 50,
    marginBottom: 20,
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 50,
    color: '#0000ff',
  },
});