import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  TextInput,
  LayoutAnimation,
  UIManager,
  Platform,
  Animated,
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get('window');

const SPECIALTIES = [
  { name: "Hematology", icon: "water" },
  { name: "Biochemistry", icon: "flask" },
  { name: "Microbiology", icon: "virus" },
  { name: "Immunology", icon: "shield-check" },
  { name: "Quiz", icon: "clipboard-text" },
  { name: "Q&S", icon: "pencil" },
];

const DATA = {
  Hematology: require('./Hematology.json').Hematology,
  Biochemistry: require('./Biochemistry.json').Biochemistry,
  Microbiology: require('./Microbiology.json').Microbiology,
  Immunology: require('./Immunology.json').Immunology,
  Quiz: require('./Questions.json').Questions,
  "Q&S": require('./answered.json').answered,
};

/* ================== Animated Header/Footer ================== */
const AnimatedWave = ({ height, style }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 8],
  });
  return (
    <Animated.View style={[style, { transform: [{ translateY }] }]} />
  );
};

/* ================== Header ================== */
const Header = () => (
  <AnimatedWave
    height={60}
    style={styles.header}
  >
    <Text style={styles.headerText}>MAFLab</Text>
  </AnimatedWave>
);

/* ================== Wave Footer ================== */
const WaveyFooter = () => (
  <AnimatedWave
    height={40}
    style={styles.waveFooter}
  />
);

/* ================== Splash Screen ================== */
const SplashScreen = () => {
  return (
    <SafeAreaView style={styles.splashContainer}>
      <MaterialCommunityIcons name="flask" size={100} color="#b91c1c" />
      <Text style={styles.appName}>MAFLab</Text>
    </SafeAreaView>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setSearchText('');
  }, [selectedSpecialty]);

  /* ================= SPLASH ================= */
  if (showSplash) return <SplashScreen />;

  /* ================= QUIZ ================= */
  if (selectedSpecialty === "Quiz") {
    const questions = DATA.Quiz || [];
    const q = questions[questionIndex];
    const progress = ((questionIndex + 1) / questions.length) * 100;
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            setSelectedSpecialty(null);
            setQuestionIndex(0);
            setSelectedAnswer(null);
          }}
        >
          <FontAwesome5 name="arrow-left" size={18} color="#fff" />
          <Text style={styles.backText}> Back</Text>
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.questionText}>{q.question}</Text>
          {q.options.map((opt, i) => {
            let bg = '#fff';
            if (selectedAnswer) {
              if (opt === q.answer) bg = '#22c55e';
              else if (opt === selectedAnswer) bg = '#ef4444';
            }
            return (
              <TouchableOpacity
                key={i}
                style={[styles.option, { backgroundColor: bg }]}
                onPress={() => !selectedAnswer && setSelectedAnswer(opt)}
              >
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
          {selectedAnswer && (
            <View style={styles.explanationBox}>
              <Text style={styles.exTitle}>Explanation</Text>
              <Text>{q.explanation}</Text>
            </View>
          )}
          <View style={styles.navButtons}>
            <TouchableOpacity
              disabled={questionIndex === 0}
              style={styles.navBtn}
              onPress={() => {
                setQuestionIndex(questionIndex - 1);
                setSelectedAnswer(null);
              }}
            >
              <Text style={styles.navText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled={questionIndex === questions.length - 1}
              style={styles.navBtn}
              onPress={() => {
                setQuestionIndex(questionIndex + 1);
                setSelectedAnswer(null);
              }}
            >
              <Text style={styles.navText}>Next</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <WaveyFooter />
      </SafeAreaView>
    );
  }

  /* ================= Q&S ================= */
  if (selectedSpecialty === "Q&S") {
    const qsList = DATA["Q&S"] || [];
    const toggleExpand = (index) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpandedQuestions((prev) => ({
        ...prev,
        [index]: !prev[index],
      }));
    };
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedSpecialty(null)}
        >
          <FontAwesome5 name="arrow-left" size={18} color="#fff" />
          <Text style={styles.backText}> Back</Text>
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {qsList.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() => toggleExpand(index)}
            >
              <Text style={styles.cardTitle}>{item.question}</Text>
              {expandedQuestions[index] && (
                <View style={styles.answerBox}>
                  <Text>{item.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <WaveyFooter />
      </SafeAreaView>
    );
  }

  /* ================= ANALYSIS LIST ================= */
  if (selectedSpecialty) {
    const filteredList =
      selectedSpecialty !== "Quiz" && selectedSpecialty !== "Q&S"
        ? DATA[selectedSpecialty].filter((item) =>
            item.name.toLowerCase().includes(searchText.toLowerCase())
          )
        : DATA[selectedSpecialty];
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedSpecialty(null)}
        >
          <FontAwesome5 name="arrow-left" size={18} color="#fff" />
          <Text style={styles.backText}> Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{selectedSpecialty}</Text>
        {selectedSpecialty !== "Quiz" && selectedSpecialty !== "Q&S" && (
          <TextInput
            style={styles.searchInput}
            placeholder="Search analysis..."
            value={searchText}
            onChangeText={setSearchText}
          />
        )}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filteredList.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardText}>Overview: {item.overview}</Text>
              <Text style={styles.cardText}>Organ: {item.organ}</Text>
              <Text style={styles.cardText}>Sample: {item.sample}</Text>
              <Text style={styles.high}>High Conditions:</Text>
              {item.high_conditions.map((h, i) => (
                <Text key={i}>• {h}</Text>
              ))}
              <Text style={styles.low}>Low Conditions:</Text>
              {item.low_conditions.map((l, i) => (
                <Text key={i}>• {l}</Text>
              ))}
            </View>
          ))}
        </ScrollView>
        <WaveyFooter />
      </SafeAreaView>
    );
  }

  /* ================= GRID ================= */
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <FlatList
        data={SPECIALTIES}
        numColumns={2}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.gridContainer}
        renderItem={({ item }) => (
          <GridItem item={item} onPress={() => setSelectedSpecialty(item.name)} />
        )}
      />
      <Text style={styles.footerTextBelowGrid}>Created by / Dr Mohamed Ahmed Fathy</Text>
      <WaveyFooter />
    </SafeAreaView>
  );
}

/* ================= Grid Item بدون Animation ================== */
const GridItem = ({ item, onPress }) => {
  const [pressed, setPressed] = useState(false);

  return (
    <View style={{ flex: 1, margin: 10 }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={[styles.gridItem, { backgroundColor: pressed ? '#fca5a5' : '#fff' }]}
      >
        <MaterialCommunityIcons name={item.icon} size={42} color={pressed ? '#fff' : '#b91c1c'} />
        <Text style={[styles.gridText, { color: pressed ? '#fff' : '#000' }]}>{item.name}</Text>
      </TouchableOpacity>
    </View>
  );
};

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef6ff',
    paddingHorizontal: 16,
    paddingTop: 44,
  },
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef6ff',
  },
  appName: {
    marginTop: 20,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
  },
  header: {
    height: 60,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 10,
  },
  headerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  gridContainer: {
    paddingBottom: 20,
    paddingTop: 20,
  },
  gridItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: width * 0.35,
  },
  gridText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  backButton: {
    flexDirection: 'row',
    backgroundColor: '#dc2626',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2563eb',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cardText: {
    marginBottom: 4,
  },
  high: {
    color: 'green',
    fontWeight: 'bold',
    marginTop: 8,
  },
  low: {
    color: 'red',
    fontWeight: 'bold',
    marginTop: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  option: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  optionText: {
    fontWeight: 'bold',
  },
  explanationBox: {
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  exTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navBtn: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  navText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#c7d2fe',
    borderRadius: 4,
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  footerTextBelowGrid: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 45,
    color: '#dc2626',
  },
  answerBox: {
    marginTop: 8,
    backgroundColor: '#dbeafe',
    borderRadius: 10,
    padding: 10,
  },
  waveFooter: {
    height: 40,
    backgroundColor: '#dc2626',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 10,
  },
});