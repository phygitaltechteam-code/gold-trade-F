import React from 'react';
import {Header} from '../components/Header';
import {CardCarousel} from '../components/CardCarousel';
import {QuickActions} from '../components/QuickActions';
import {TransactionList} from '../components/TransactionList';
import {BankCard, Transaction} from '../types';
import {MdPayment, MdShoppingBag, MdCoffee, MdMovie} from 'react-icons/md';
import Footer from '@/features/Footer/Footer';
const mockCards: BankCard[] = [
  {
    id: '1',
    type: 'E Private Account',
    balance: 870.5,
    currency: 'USD',
    isPrimary: true,
    theme: 'orange',
  },
  {
    id: '2',
    type: 'Temporarily Virtual Account',
    balance: 3500.0,
    currency: 'USD',
    isPrimary: false,
    theme: 'dark',
  },
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    title: 'Income',
    date: 'Today, 9:00 AM',
    amount: 420.0,
    type: 'income',
    category: 'Salary',
    icon: MdPayment,
    colorClass: 'text-green-600 dark:text-green-400',
    iconBgClass: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    id: '2',
    title: 'Marketplace',
    date: 'Yesterday, 5:42 PM',
    amount: 30.0,
    type: 'expense',
    category: 'Electronics',
    icon: MdShoppingBag,
    colorClass: 'text-primary dark:text-orange-400',
    iconBgClass: 'bg-primary/10 dark:bg-orange-900/30',
  },
  {
    id: '3',
    title: 'Cafe Central',
    date: 'Yesterday, 8:15 AM',
    amount: 4.2,
    type: 'expense',
    category: 'Food & Drink',
    icon: MdCoffee,
    colorClass: 'text-slate-600 dark:text-slate-300',
    iconBgClass: 'bg-slate-100 dark:bg-slate-700',
  },
  {
    id: '4',
    title: 'Netflix Subscription',
    date: 'Oct 24, 10:00 AM',
    amount: 15.99,
    type: 'expense',
    category: 'Entertainment',
    icon: MdMovie,
    colorClass: 'text-red-600 dark:text-red-400',
    iconBgClass: 'bg-red-100 dark:bg-red-900/30',
  },
];

const Dashboard: React.FC = () => {
  return (
    <>
      <div className="bg-background-light dark:bg-background-dark relative mx-auto flex h-full w-full max-w-md flex-col overflow-x-hidden shadow-2xl">
        <div className="h-2 w-full bg-transparent" />
        <Header />
        <main className="flex flex-1 flex-col">
          <CardCarousel cards={mockCards} />
          <QuickActions />
          <TransactionList transactions={mockTransactions} />
        </main>
      </div>
      <Footer />
    </>
  );
};

export default Dashboard;
