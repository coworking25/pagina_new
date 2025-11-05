# Real Estate Management Platform

A comprehensive real estate management platform built with React, TypeScript, and Supabase, designed for managing properties, clients, appointments, and more.

## 🚀 Features

### Property Management
- ✅ Property listings with advanced search and filters
- ✅ Image galleries with cover image selection
- ✅ Video integration for property tours
- ✅ Automatic property code generation
- ✅ Property status tracking (Disponible, Vendida, Arrendada)
- ✅ Multiple property types (Casa, Apartamento, Local, Lote)

### Client Management
- ✅ Complete client wizard for onboarding
- ✅ Client portal with authentication
- ✅ Document management system
- ✅ Payment tracking and history
- ✅ Client-property relationships
- ✅ Reference management

### Calendar & Appointments
- ✅ Interactive calendar with appointment scheduling
- ✅ Google Calendar integration
- ✅ Advisor availability management
- ✅ Appointment status tracking
- ✅ Email notifications

### Administration
- ✅ Dashboard with analytics and statistics
- ✅ Advisor management system
- ✅ Inquiry tracking
- ✅ Role-based access control (Admin/Advisor)
- ✅ Settings management

### Analytics
- ✅ Property view tracking
- ✅ Inquiry statistics
- ✅ Appointment metrics
- ✅ Interactive charts and graphs

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router v7** - Routing
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Recharts** - Data visualization

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Storage
  - Row Level Security (RLS)

### Additional Libraries
- **Lucide React** - Icons
- **date-fns** - Date manipulation
- **React Big Calendar** - Calendar component
- **jsPDF** - PDF generation
- **xlsx** - Excel export

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- Git

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/coworking25/pagina_new.git
   cd pagina_new
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   
   Run the migration scripts in the `db/migrations/` directory to set up your database schema.

## 🚀 Development

### Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for production
```bash
npm run build
```

### Preview production build
```bash
npm run preview
```

### Lint code
```bash
npm run lint
```

## 📁 Project Structure

```
pagina_new/
├── src/
│   ├── components/          # React components
│   │   ├── Admin*/          # Admin panel components
│   │   ├── Calendar/        # Calendar & appointments
│   │   ├── Client*/         # Client portal components
│   │   ├── Home/            # Public-facing components
│   │   └── ...
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom hooks
│   ├── pages/               # Route pages
│   ├── services/            # API services
│   ├── store/               # Zustand stores
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main app component
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── db/                      # Database files
│   ├── migrations/          # SQL migrations
│   └── scripts/             # Database scripts
├── docs/                    # Documentation
├── .env.example             # Environment variables template
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── tailwind.config.js       # Tailwind CSS configuration
```

## 🔐 Authentication

The platform uses Supabase Authentication with:
- Email/password authentication
- Row Level Security (RLS) policies
- Role-based access (admin/advisor/client)

### User Roles
- **Admin**: Full system access
- **Advisor**: Property and client management
- **Client**: Portal access to their properties and documents

## 📊 Database Schema

Key tables:
- `properties` - Property listings
- `clients` - Client information
- `advisors` - Advisor profiles
- `appointments` - Calendar appointments
- `inquiries` - Property inquiries
- `client_documents` - Document storage
- `client_payments` - Payment records
- `analytics_*` - Analytics tracking

## 🔒 Security

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Secure authentication with Supabase
- ✅ Environment variables for sensitive data
- ✅ Input validation and sanitization
- ⚠️ 3 remaining npm vulnerabilities (see PROJECT_ANALYSIS_AND_RECOMMENDATIONS.md)

## 🐛 Known Issues

See `PROJECT_ANALYSIS_AND_RECOMMENDATIONS.md` for a complete analysis of:
- Security vulnerabilities
- Code quality issues
- Performance optimizations needed
- Technical debt

## 📈 Performance

Current bundle sizes:
- Main bundle: ~539 KB (gzipped: 164 KB)
- Largest chunks optimized with code splitting recommended

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Code Style

- ESLint configuration enforced
- TypeScript strict mode recommended
- Prettier for code formatting (optional)

## 🧪 Testing

Currently, testing infrastructure needs to be set up. See recommendations in `PROJECT_ANALYSIS_AND_RECOMMENDATIONS.md`.

## 📄 License

This project is private and proprietary.

## 👥 Authors

- Coworking25 Team

## 📞 Support

For support, contact the development team.

## 🗺️ Roadmap

See `PROJECT_ANALYSIS_AND_RECOMMENDATIONS.md` for detailed improvement plan:
- [ ] Fix remaining security vulnerabilities
- [ ] Implement comprehensive testing
- [ ] Code splitting for better performance
- [ ] TypeScript strict mode
- [ ] Documentation improvements
- [ ] UI/UX enhancements

## 🔗 Links

- [Supabase Documentation](https://supabase.io/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

*Last Updated: November 2025*
