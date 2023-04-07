import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  View,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as SQLite from "expo-sqlite";

SplashScreen.preventAutoHideAsync();
setTimeout(SplashScreen.hideAsync, 2000)

const db = SQLite.openDatabase('BMIdb.db');

export default class App extends Component {
  state = {
    results: '',
    weight: '',
    height: '',
    data: [],
  };

  componentDidMount() {
    db.transaction((tx) => {
      tx.executeSql(
        'create table if not exists bmis (id integer primary key not null, bmi text, height int, weight int, itemDate real);'
      );
    });

    this.fetchData();
  }

  fetchData = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT id, bmi, height, weight, date(itemDate) as itemDate FROM bmis order by itemDate desc;',
        [],
        (_, { rows: { _array } }) => {
          this.setState({ data: _array });
        }
      );
    });
  };


  onTitleChange = (weight) => this.setState({ weight });
  onPostChange = (height) => this.setState({ height });

  onSave = () => {
    const { weight, height, results } = this.state;
    let maths = (weight / (height * height)) * 703;

    if (!isNaN(maths)) {
      this.setState({ results: maths.toFixed(1) });
      db.transaction(
        (tx) => {
          tx.executeSql(
            'INSERT INTO bmis (bmi, height, weight, itemDate) VALUES (?, ?, ?, julianday("now"))',[maths.toFixed(1), height, weight]);
        },
        null,
        this.fetchData,
      );
    }
  };

  render() {
    const { results, weight, height, data } = this.state;

    onCalc = (results) => {
      if(results < 18.5){
        return "(Underweight)";
      }
  
      if(results > 18.5 && results < 24.9){
        return "(Healthy)";
      }
  
      if(results > 25.0 && results< 29.9){
        return "(Overweight)";
      }
  
      if(results > 30.00){
        return "(Obese)";
      }
    }

    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.toolbar}>BMI Calculator</Text>
        <ScrollView style={styles.content}>
          <TextInput
            style={styles.input}
            onChangeText={this.onTitleChange}
            value={weight}
            placeholder="Weight in Pounds"
          />
          <TextInput
            style={styles.input}
            onChangeText={this.onPostChange}
            value={height}
            placeholder="Height in inches"
          />
          <TouchableOpacity style={styles.button} onPress={this.onSave}>
            <Text style={styles.buttonText}>Compute BMI</Text>
          </TouchableOpacity>
          <View style={styles.bmi}>
          {results !== "" ? <Text style={styles.bmiConent} >Body Mass Index is {(results)} {onCalc(results)}</Text> : <Text style={styles.bmi}></Text>}
          </View>
            <Text style={styles.sectionHeading}>BMI History</Text>
            {data.map((item, index) => (
              <Text style={styles.historyText} key={index}>{item.itemDate}:   {item.bmi} (W:{item.weight}, H:{item.height})</Text>
            ))}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  toolbar: {
    backgroundColor: '#f4511e',
    color: '#fff',
    textAlign: 'center',
    padding: 25,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  content: {
    flex: 1,
    fontSize: 20,
    marginLeft: 20,
  },
  contentTop: {
    flex: 1,
    fontSize: 20,
    paddingTop: 90,
  },
  input: {
    backgroundColor: '#ecf0f1',
    borderRadius: 3,
    height: 40,
    padding: 5,
    marginBottom: 10,
    flex: 1,
    fontSize: 24,
    marginRight: 15,

  },
  button: {
    backgroundColor: '#34495e',
    padding: 10,
    borderRadius: 3,
    marginBottom: 30,
    alignItems: 'center',
    marginRight: 15,
  },
  buttonText: {
    fontSize: 24,
    color: "white",
  },
  bmi: {
    paddingTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  bmiConent: {
    textAlign: 'center',
    fontSize: 28,
  },
  sectionHeading: {
    fontSize: 24,
    marginBottom: 8,
  },
  historyText: {
    fontSize: 20,
  },

});