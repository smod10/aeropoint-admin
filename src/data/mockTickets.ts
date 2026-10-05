export type SupportTicket = {
  id: string;
  customer: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'Open' | 'In progress' | 'Resolved';
  replies: { author: string; message: string; createdAt: string }[];
};

export const mockTickets: SupportTicket[] = [
  { id: 'TKT-1048', customer: 'Chinedu Okafor', email: 'chinedu@example.com', subject: 'Booking confirmation not received', message: 'I completed payment for my flight but have not received the confirmation email.', createdAt: 'Today, 09:42', status: 'Open', replies: [] },
  { id: 'TKT-1047', customer: 'Amina Yusuf', email: 'amina.h@example.com', subject: 'Request to change travel date', message: 'Please help me move my departure to the following day.', createdAt: 'Today, 08:15', status: 'In progress', replies: [{ author: 'Support', message: 'We are checking the airline change options and will update you shortly.', createdAt: 'Today, 08:40' }] },
  { id: 'TKT-1046', customer: 'Omar Farooq', email: 'omar.f@example.com', subject: 'Refund status', message: 'Could you confirm when the cancellation refund will be processed?', createdAt: 'Yesterday', status: 'Open', replies: [] },
];