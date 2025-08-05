# 🏪 Gestion Magasin - Système de Ventes & Achats

Application web moderne développée avec **Next.js 15** et **Supabase** pour la gestion complète des ventes et achats d'un magasin.

## 🎯 Fonctionnalités

- **Authentification sécurisée** avec hashage des mots de passe
- **Gestion des utilisateurs** avec rôles (Admin, Employé)
- **Gestion des ventes** avec suivi client et produits
- **Gestion des achats** avec suivi fournisseurs
- **Tableau de bord** avec statistiques en temps réel
- **Interface responsive** optimisée mobile et desktop

## 🛠️ Technologies

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Lucide React Icons
- **Backend**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth + Custom Logic
- **Validation**: Zod, React Hook Form
- **Sécurité**: bcryptjs, RLS (Row Level Security)

## 📁 Structure du Projet

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── auth/login/        # Page de connexion
│   ├── dashboard/         # Tableau de bord
│   └── api/auth/          # API Routes
├── components/            # Composants réutilisables
│   ├── ui/               # Composants UI de base
│   ├── forms/            # Formulaires
│   └── layout/           # Composants de mise en page
├── lib/                  # Utilitaires et configuration
│   ├── supabase/         # Configuration Supabase
│   └── validations/      # Schémas de validation
├── types/                # Types TypeScript
└── hooks/                # Hooks personnalisés
```

## 🚀 Installation

1. **Cloner le projet**
```bash
git clone <your-repo-url>
cd store_managment
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Supabase**

Créez un projet sur [Supabase](https://supabase.com) et exécutez le script SQL suivant :

```sql
-- Voir le fichier database-schema.sql pour le schéma complet
```

4. **Variables d'environnement**

Créez un fichier `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

5. **Lancer l'application**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 👤 Compte par défaut

- **Email**: `admin@store.com`
- **Mot de passe**: `admin123`
- **Rôle**: Administrateur

## 📊 Base de données

### Tables principales

1. **utilisateurs** - Gestion des utilisateurs et authentification
2. **ventes** - Enregistrement des transactions de vente
3. **lignes_vente** - Détails des produits vendus
4. **achats** - Enregistrement des achats fournisseurs
5. **lignes_achat** - Détails des produits achetés

### Sécurité

- **RLS (Row Level Security)** activé sur toutes les tables
- **Hashage bcrypt** pour les mots de passe
- **Middleware d'authentification** pour la protection des routes
- **Validation côté client et serveur** avec Zod

## 🔧 Développement

### Scripts disponibles

```bash
npm run dev      # Démarrage en mode développement
npm run build    # Build de production
npm run start    # Démarrage en mode production
npm run lint     # Vérification du code
```

### Structure des rôles

- **Admin** : Accès complet (utilisateurs, ventes, achats)
- **Employé** : Accès limité (ventes, achats uniquement)

## 🎨 Interface

- **Design moderne** avec Tailwind CSS
- **Composants réutilisables** avec variants
- **Navigation responsive** avec menu mobile
- **Formulaires validés** avec feedback utilisateur
- **Tableaux de bord interactifs** avec statistiques

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :
- 📱 Mobile (320px+)
- 📟 Tablette (768px+)
- 💻 Desktop (1024px+)

## 🔄 Prochaines fonctionnalités

- [ ] Gestion des stocks
- [ ] Rapports et exports
- [ ] Notifications en temps réel
- [ ] Gestion des catégories produits
- [ ] API REST complète
- [ ] Tests automatisés

## 📄 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

Développé avec ❤️ et Next.js 15