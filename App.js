import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Picker, ScrollView, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App = () => {
  const [tab, setTab] = useState('Booking');
  const [bookings, setBookings] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [table, setTable] = useState('Table 1');
  const [duration, setDuration] = useState('1');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [saleItem, setSaleItem] = useState('Cigarettes (₹25)');
  const [quantity, setQuantity] = useState('1');
  const [expenseCategory, setExpenseCategory] = useState('Rent');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [reportPeriod, setReportPeriod] = useState('Daily');

  useEffect(() => {
    const loadData = async () => {
      const storedBookings = await AsyncStorage.getItem('bookings');
      const storedSales = await AsyncStorage.getItem('sales');
      const storedExpenses = await AsyncStorage.getItem('expenses');
      if (storedBookings) setBookings(JSON.parse(storedBookings));
      if (storedSales) setSales(JSON.parse(storedSales));
      if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
    };
    loadData();
  }, []);

  const saveData = async (key, data) => {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  };

  const addBooking = () => {
    const rate = table.includes('Snooker') ? 250 : 150;
    const cost = rate * parseFloat(duration);
    const newBooking = { table, duration, paymentMode, cost, date: new Date().toISOString() };
    setBookings([...bookings, newBooking]);
    saveData('bookings', [...bookings, newBooking]);
    setDuration('1');
  };

  const addSale = () => {
    const price = saleItem.includes('25') ? 25 : saleItem.includes('20') ? 20 : 20;
    const cost = price * parseInt(quantity);
    const newSale = { item: saleItem, quantity, cost, paymentMode, date: new Date().toISOString() };
    setSales([...sales, newSale]);
    saveData('sales', [...sales, newSale]);
    setQuantity('1');
  };

  const addExpense = () => {
    const newExpense = { category: expenseCategory, amount: parseFloat(expenseAmount), date: new Date().toISOString() };
    setExpenses([...expenses, newExpense]);
    saveData('expenses', [...expenses, newExpense]);
    setExpenseAmount('');
  };

  const generateReport = () => {
    const now = new Date();
    let startDate;
    if (reportPeriod === 'Daily') startDate = new Date(now.setHours(0, 0, 0, 0));
    else if (reportPeriod === 'Weekly') startDate = new Date(now.setDate(now.getDate() - 7));
    else startDate = new Date(now.setMonth(now.getMonth() - 1));

    const filteredBookings = bookings.filter(b => new Date(b.date) >= startDate);
    const filteredSales = sales.filter(s => new Date(s.date) >= startDate);
    const filteredExpenses = expenses.filter(e => new Date(e.date) >= startDate);

    const bookingRevenue = filteredBookings.reduce((sum, b) => sum + b.cost, 0);
    const salesRevenue = filteredSales.reduce((sum, s) => sum + s.cost, 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const profitLoss = bookingRevenue + salesRevenue - totalExpenses;

    return { bookingRevenue, salesRevenue, totalExpenses, profitLoss, filteredBookings, filteredSales, filteredExpenses };
  };

  const report = generateReport();

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {['Booking', 'Sales', 'Expenses', 'Reports'].map(t => (
          <Button key={t} title={t} onPress={() => setTab(t)} />
        ))}
      </View>
      <ScrollView>
        {tab === 'Booking' && (
          <View>
            <Text style={styles.label}>Table:</Text>
            <Picker selectedValue={table} onValueChange={setTable}>
              <Picker.Item label="Pool Table 1" value="Table 1" />
              <Picker.Item label="Pool Table 2" value="Table 2" />
              <Picker.Item label="Pool Table 3" value="Table 3" />
              <Picker.Item label="Snooker Table 4" value="Table 4" />
              <Picker.Item label="Snooker Table 5" value="Table 5" />
            </Picker>
            <Text style={styles.label}>Duration (hrs):</Text>
            <TextInput value={duration} onChangeText={setDuration} keyboardType="numeric" style={styles.input} />
            <Text style={styles.label}>Payment Mode:</Text>
            <Picker selectedValue={paymentMode} onValueChange={setPaymentMode}>
              <Picker.Item label="Cash" value="Cash" />
              <Picker.Item label="Online" value="Online" />
            </Picker>
            <Button title="Book Table" onPress={addBooking} />
            <Text style={styles.history}>Booking History:</Text>
            {bookings.map((b, i) => (
              <Text key={i}>{`${b.table} - ${b.duration} hrs - ₹${b.cost} - ${b.paymentMode} - ${b.date}`}</Text>
            ))}
          </View>
        )}
        {tab === 'Sales' && (
          <View>
            <Text style={styles.label}>Item:</Text>
            <Picker selectedValue={saleItem} onValueChange={setSaleItem}>
              <Picker.Item label="Cigarettes (₹25)" value="Cigarettes (₹25)" />
              <Picker.Item label="Cigarettes (₹20)" value="Cigarettes (₹20)" />
              <Picker.Item label="Water (₹20)" value="Water (₹20)" />
            </Picker>
            <Text style={styles.label}>Quantity:</Text>
            <TextInput value={quantity} onChangeText={setQuantity} keyboardType="numeric" style={styles.input} />
            <Text style={styles.label}>Payment Mode:</Text>
            <Picker selectedValue={paymentMode} onValueChange={setPaymentMode}>
              <Picker.Item label="Cash" value="Cash" />
              <Picker.Item label="Online" value="Online" />
            </Picker>
            <Button title="Add Sale" onPress={addSale} />
            <Text style={styles.history}>Sales History:</Text>
            {sales.map((s, i) => (
              <Text key={i}>{`${s.item} - ${s.quantity} - ₹${s.cost} - ${s.paymentMode} - ${s.date}`}</Text>
            ))}
          </View>
        )}
        {tab === 'Expenses' && (
          <View>
            <Text style={styles.label}>Category:</Text>
            <Picker selectedValue={expenseCategory} onValueChange={setExpenseCategory}>
              <Picker.Item label="Rent" value="Rent" />
              <Picker.Item label="Electricity" value="Electricity" />
              <Picker.Item label="Salary" value="Salary" />
              <Picker.Item label="Maintenance" value="Maintenance" />
              <Picker.Item label="Supplies" value="Supplies" />
            </Picker>
            <Text style={styles.label}>Amount (₹):</Text>
            <TextInput value={expenseAmount} onChangeText={setExpenseAmount} keyboardType="numeric" style={styles.input} />
            <Button title="Add Expense" onPress={addExpense} />
            <Text style={styles.history}>Expenses History:</Text>
            {expenses.map((e, i) => (
              <Text key={i}>{`${e.category} - ₹${e.amount} - ${e.date}`}</Text>
            ))}
          </View>
        )}
        {tab === 'Reports' && (
          <View>
            <Text style={styles.label}>Period:</Text>
            <Picker selectedValue={reportPeriod} onValueChange={setReportPeriod}>
              <Picker.Item label="Daily" value="Daily" />
              <Picker.Item label="Weekly" value="Weekly" />
              <Picker.Item label="Monthly" value="Monthly" />
            </Picker>
            <Text style={styles.history}>Report:</Text>
            <Text>Booking Revenue: ₹{report.bookingRevenue}</Text>
            <Text>Sales Revenue: ₹{report.salesRevenue}</Text>
            <Text>Total Expenses: ₹{report.totalExpenses}</Text>
            <Text>Profit/Loss: ₹{report.profitLoss}</Text>
            <Text style={styles.history}>Details:</Text>
            <Text>Bookings:</Text>
            {report.filteredBookings.map((b, i) => (
              <Text key={i}>{`${b.table} - ₹${b.cost} - ${b.date}`}</Text>
            ))}
            <Text>Sales:</Text>
            {report.filteredSales.map((s, i) => (
              <Text key={i}>{`${s.item} - ₹${s.cost} - ${s.date}`}</Text>
            ))}
            <Text>Expenses:</Text>
            {report.filteredExpenses.map((e, i) => (
              <Text key={i}>{`${e.category} - ₹${e.amount} - ${e.date}`}</Text>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#e6ecf0' },
  tabBar: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  label: { fontSize: 16, marginVertical: 10 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
  history: { fontSize: 16, fontWeight: 'bold', marginVertical: 10 },
});

export default App;