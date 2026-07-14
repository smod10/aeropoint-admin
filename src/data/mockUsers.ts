export const mockUsers = [
  // Admins
  { id: 1, uid: '9a42d8ff0ec2e2895124373', status: true, banned: false, firstName: 'Super', lastName: 'Admin', email: 'admin@aeropoint.com', phone: '+1 234 567 8900', role: 'admin', balance: '0.00', verified: true, createdAt: 'Jan 01, 2026 10:00 AM' },
  { id: 2, uid: 'aa12d9ff1fd3f3906235484', status: true, banned: false, firstName: 'James', lastName: 'Obi', email: 'james.obi@aeropoint.com', phone: '+234 802 111 2222', role: 'admin', balance: '0.00', verified: true, createdAt: 'Jan 15, 2026 09:00 AM' },

  // Employees
  { id: 3, uid: '4e9784aa5f97c8451090938', status: true, banned: false, firstName: 'Aisha', lastName: 'Bello', email: 'aisha.bello@aeropoint.com', phone: '+234 803 456 7890', role: 'employee', balance: '0.00', verified: true, createdAt: 'May 10, 2026 08:20 AM' },
  { id: 4, uid: 'bb23eaff2ge4g4017346595', status: true, banned: false, firstName: 'Tunde', lastName: 'Adeyemi', email: 'tunde.a@aeropoint.com', phone: '+234 806 234 5678', role: 'employee', balance: '0.00', verified: true, createdAt: 'Mar 20, 2026 10:30 AM' },
  { id: 5, uid: 'cc34fbgg3hf5h5128457606', status: false, banned: false, firstName: 'Ngozi', lastName: 'Eze', email: 'ngozi.e@aeropoint.com', phone: '+234 809 876 5432', role: 'employee', balance: '0.00', verified: true, createdAt: 'Apr 05, 2026 14:00 PM' },

  // Agents
  { id: 6, uid: '7b20b7dd8ca0f1784013261', status: true, banned: false, firstName: 'Sarah', lastName: 'Jenkins', email: 'sarah.j@example.com', phone: '+44 7700 900077', role: 'agent', balance: '1250.00', verified: true, createdAt: 'Feb 12, 2026 14:30 PM' },
  { id: 7, uid: '6c19a6cc7db9e0673012150', status: false, banned: false, firstName: 'Michael', lastName: 'Johnson', email: 'mike.j@example.com', phone: '+1 555 019 8372', role: 'agent', balance: '0.00', verified: false, createdAt: 'Mar 05, 2026 09:15 AM' },
  { id: 8, uid: '0i5340661b5384017656594', status: true, banned: false, firstName: 'David', lastName: 'Chen', email: 'david.chen@example.com', phone: '+1 416 555 0198', role: 'agent', balance: '340.00', verified: true, createdAt: 'Jul 12, 2026 19:40 PM' },
  { id: 9, uid: 'dd45gcgh4ig6i6239568717', status: true, banned: false, firstName: 'Kolade', lastName: 'Adebayo', email: 'kolade.a@travelagency.com', phone: '+234 807 123 4567', role: 'agent', balance: '880.00', verified: true, createdAt: 'May 22, 2026 11:00 AM' },
  { id: 10, uid: 'ee56hdhj5jh7j7340679828', status: true, banned: false, firstName: 'Priya', lastName: 'Sharma', email: 'priya.s@tripmate.in', phone: '+91 98765 43210', role: 'agent', balance: '2100.50', verified: true, createdAt: 'Apr 18, 2026 16:45 PM' },
  { id: 11, uid: 'ff67ieij6ki8k8451780939', status: false, banned: false, firstName: 'Lucas', lastName: 'Mota', email: 'lucas.m@flybrazil.com', phone: '+55 11 98765 4321', role: 'agent', balance: '0.00', verified: false, createdAt: 'Jun 30, 2026 09:20 AM' },

  // Suppliers
  { id: 12, uid: '5d0895bb6ea8d9562001049', status: true, banned: false, firstName: 'Duffel', lastName: 'API', email: 'api@duffel.com', phone: '+44 20 7123 4567', role: 'supplier', balance: '0.00', verified: true, createdAt: 'Apr 20, 2026 11:45 AM' },
  { id: 13, uid: '1h6451772c6495128767605', status: true, banned: false, firstName: 'Viator', lastName: 'Tours', email: 'supplier@viator.com', phone: '+1 888 655 4556', role: 'supplier', balance: '0.00', verified: true, createdAt: 'Jul 10, 2026 10:25 AM' },
  { id: 14, uid: 'gg78jfjk7lj9l9562891040', status: true, banned: false, firstName: 'Hotelbeds', lastName: 'API', email: 'connect@hotelbeds.com', phone: '+34 971 563 235', role: 'supplier', balance: '0.00', verified: true, createdAt: 'Feb 01, 2026 08:00 AM' },
  { id: 15, uid: 'hh89kgkl8mk0m0673902151', status: false, banned: false, firstName: 'Amadeus', lastName: 'GDS', email: 'gds@amadeus.com', phone: '+33 1 74 72 00 00', role: 'supplier', balance: '0.00', verified: true, createdAt: 'Jan 10, 2026 12:00 PM' },

  // Customers
  { id: 16, uid: '8d31c9ee9fb1d1784013262', status: true, banned: false, firstName: 'Chinedu', lastName: 'Okafor', email: 'chinedu@example.com', phone: '+234 801 234 5678', role: 'customer', balance: '0.00', verified: true, createdAt: 'Jul 14, 2026 07:14 AM' },
  { id: 17, uid: '2g7562883d75a6239878716', status: true, banned: false, firstName: 'Elena', lastName: 'Rodriguez', email: 'elena.r@example.com', phone: '+34 600 123 456', role: 'customer', balance: '45.50', verified: true, createdAt: 'Jul 01, 2026 13:10 PM' },
  { id: 18, uid: 'ii90lhlm9nl1n1784013262', status: true, banned: false, firstName: 'Fatima', lastName: 'Al-Sayed', email: 'fatima.sayed@example.com', phone: '+234 804 567 8901', role: 'customer', balance: '0.00', verified: true, createdAt: 'Jul 14, 2026 08:50 AM' },
  { id: 19, uid: 'jj01mimn0om2o2895124373', status: true, banned: false, firstName: 'Omar', lastName: 'Farooq', email: 'omar.f@example.com', phone: '+234 805 678 9012', role: 'customer', balance: '0.00', verified: true, createdAt: 'Jul 10, 2026 10:00 AM' },
  { id: 20, uid: 'kk12njno1pn3p3006235484', status: true, banned: false, firstName: 'Samuel', lastName: 'Ojo', email: 'samuel.o@example.com', phone: '+234 810 789 0123', role: 'customer', balance: '0.00', verified: true, createdAt: 'Jul 14, 2026 07:55 AM' },
  { id: 21, uid: 'll23okop2qo4q4117346595', status: true, banned: false, firstName: 'Amina', lastName: 'Yusuf', email: 'amina.y@example.com', phone: '+234 811 890 1234', role: 'customer', balance: '200.00', verified: true, createdAt: 'Jun 25, 2026 14:30 PM' },
  { id: 22, uid: 'mm34plpq3rp5r5228457606', status: true, banned: false, firstName: 'Emeka', lastName: 'Nwosu', email: 'emeka.n@example.com', phone: '+234 812 901 2345', role: 'customer', balance: '0.00', verified: false, createdAt: 'Jul 05, 2026 09:45 AM' },
  { id: 23, uid: 'nn45qmqr4sq6s6339568717', status: true, banned: false, firstName: 'Zainab', lastName: 'Hassan', email: 'zainab.h@example.com', phone: '+234 813 012 3456', role: 'customer', balance: '75.00', verified: true, createdAt: 'Jul 08, 2026 16:20 PM' },
  { id: 24, uid: 'oo56rnrs5tr7t7440679828', status: false, banned: false, firstName: 'John', lastName: 'Smith', email: 'john.smith@example.com', phone: '+44 7911 123456', role: 'customer', balance: '0.00', verified: false, createdAt: 'Jun 10, 2026 11:10 AM' },
  { id: 25, uid: 'pp67sost6us8u8551780939', status: true, banned: false, firstName: 'Yemi', lastName: 'Adeleke', email: 'yemi.a@example.com', phone: '+234 814 123 4567', role: 'customer', balance: '500.00', verified: true, createdAt: 'May 30, 2026 15:00 PM' },
  { id: 26, uid: 'qq78tptu7vt9v9662891040', status: true, banned: false, firstName: 'Blessing', lastName: 'Obi', email: 'blessing.o@example.com', phone: '+234 815 234 5678', role: 'customer', balance: '0.00', verified: true, createdAt: 'Jul 13, 2026 18:30 PM' },
  { id: 27, uid: 'rr89uquv8wu0w0773902151', status: true, banned: false, firstName: 'Tariq', lastName: 'Mahmoud', email: 'tariq.m@example.com', phone: '+971 50 123 4567', role: 'customer', balance: '150.00', verified: true, createdAt: 'Jun 20, 2026 12:00 PM' },
  { id: 28, uid: 'ss90vrwx9xv1x1884013262', status: true, banned: false, firstName: 'Grace', lastName: 'Otieno', email: 'grace.o@example.com', phone: '+254 712 345 678', role: 'customer', balance: '0.00', verified: true, createdAt: 'Jul 02, 2026 10:40 AM' },
  { id: 29, uid: 'tt01wsxy0yw2y2995124373', status: false, banned: true, firstName: 'Spam', lastName: 'Account', email: 'spam@bot.com', phone: '+1 000 000 0000', role: 'customer', balance: '0.00', verified: false, createdAt: 'Jun 18, 2026 16:55 PM' },
  { id: 30, uid: 'uu12xtyz1zx3z3006235484', status: true, banned: false, firstName: 'Oluwaseun', lastName: 'Babatunde', email: 'seun.b@example.com', phone: '+234 816 345 6789', role: 'customer', balance: '0.00', verified: true, createdAt: 'Jul 11, 2026 20:15 PM' },
];