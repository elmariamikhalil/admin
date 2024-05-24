import { element } from 'prop-types'
import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Companies = React.lazy(() => import('./views/theme/companies/Companies'))
const AddClient = React.lazy(() => import('./views/theme/companies/AddClient'))
const CompanyDetailPage = React.lazy(() => import('./views/theme/companies/CompanyDetailPage'))
const EditCompany = React.lazy(() => import('./views/theme/companies/EditCompany'))
const AddMemberToTeam = React.lazy(() => import('./views/theme/team/AddMemberToTeam'))
const AddTeamToClient = React.lazy(() => import('./views/theme/team/AddTeamToClient'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
// Base
const Team = React.lazy(() => import('./views/base/accordion/Team'))
const EditTeam = React.lazy(() => import('./views/base/accordion/EditTeam'))
const Users = React.lazy(() => import('./views/base/accordion/Users'))
const EditUser = React.lazy(() => import('./views/base/accordion/EditUser'))
const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'))
const Cards = React.lazy(() => import('./views/base/cards/Cards'))
const Carousels = React.lazy(() => import('./views/base/carousels/Carousels'))
const Collapses = React.lazy(() => import('./views/base/collapses/Collapses'))
const ListGroups = React.lazy(() => import('./views/base/list-groups/ListGroups'))
const Navs = React.lazy(() => import('./views/base/navs/Navs'))
const Paginations = React.lazy(() => import('./views/base/paginations/Paginations'))
const Placeholders = React.lazy(() => import('./views/base/placeholders/Placeholders'))
const Popovers = React.lazy(() => import('./views/base/popovers/Popovers'))
const Progress = React.lazy(() => import('./views/base/progress/Progress'))
const Spinners = React.lazy(() => import('./views/base/spinners/Spinners'))
const Tables = React.lazy(() => import('./views/base/tables/Tables'))
const Tooltips = React.lazy(() => import('./views/base/tooltips/Tooltips'))

// Buttons
const Buttons = React.lazy(() => import('./views/buttons/buttons/Buttons'))
const ButtonGroups = React.lazy(() => import('./views/buttons/button-groups/ButtonGroups'))
const Dropdowns = React.lazy(() => import('./views/buttons/dropdowns/Dropdowns'))

//Forms
const ChecksRadios = React.lazy(() => import('./views/forms/checks-radios/ChecksRadios'))
const FloatingLabels = React.lazy(() => import('./views/forms/floating-labels/FloatingLabels'))
const FormControl = React.lazy(() => import('./views/forms/form-control/FormControl'))
const InputGroup = React.lazy(() => import('./views/forms/input-group/InputGroup'))
const Layout = React.lazy(() => import('./views/forms/layout/Layout'))
const Range = React.lazy(() => import('./views/forms/range/Range'))
const Select = React.lazy(() => import('./views/forms/select/Select'))
const Validation = React.lazy(() => import('./views/forms/validation/Validation'))

const Charts = React.lazy(() => import('./views/charts/Charts'))

// Icons
const CoreUIIcons = React.lazy(() => import('./views/icons/coreui-icons/CoreUIIcons'))
const Flags = React.lazy(() => import('./views/icons/flags/Flags'))
const Brands = React.lazy(() => import('./views/icons/brands/Brands'))

// Notifications
const Alerts = React.lazy(() => import('./views/notifications/alerts/Alerts'))
const Badges = React.lazy(() => import('./views/notifications/badges/Badges'))
const Modals = React.lazy(() => import('./views/notifications/modals/Modals'))
const Toasts = React.lazy(() => import('./views/notifications/toasts/Toasts'))

const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const Settings = React.lazy(() => import('./views/pages/settings/SettingsPage'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/theme', name: 'Theme', element: Cards, exact: true },
  { path: '/theme/companies/Companies', name: 'Companies', element: Companies },
  { path: '/theme/companies/addclient', name: 'Add Client', element: AddClient },
  {
    path: '/theme/companies/CompanyDetailPage/:clientId',
    name: 'Company Details',
    element: CompanyDetailPage,
  },
  {
    path: '/theme/companies/EditCompany/:id',
    name: 'Edit Comapny',
    element: EditCompany,
  },
  { path: '/pages/page500', name: 'Page 500', element: Page500 },
  { path: '/theme/team', name: 'Team', element: Team },
  { path: '/theme/team/AddTeamToClient', name: 'Add Memebers To Team', element: AddTeamToClient },
  { path: '/theme/team/AddMemberToTeam', name: 'Add Team To Client', element: AddMemberToTeam },
  { path: '/base', name: 'Base', element: Cards, exact: true },
  { path: '/base/accordion/Team', name: 'Team', element: Team },
  { path: '/base/accordion/EditTeam/:id', name: 'Edit Team', element: EditTeam },
  { path: '/base/accordion/Users', name: 'Users', element: Users },
  { path: '/base/accordion/EditUser/:id', name: 'Edit User', element: EditUser },
  { path: '/buttons', name: 'Buttons', element: Buttons, exact: true },
  { path: '/buttons/buttons', name: 'Buttons', element: Buttons },
  { path: '/buttons/dropdowns', name: 'Dropdowns', element: Dropdowns },
  { path: '/buttons/button-groups', name: 'Button Groups', element: ButtonGroups },
  { path: '/charts', name: 'Charts', element: Charts },
  { path: '/forms', name: 'Forms', element: FormControl, exact: true },
  { path: '/forms/form-control', name: 'Form Control', element: FormControl },
  { path: '/forms/select', name: 'Select', element: Select },
  { path: '/forms/checks-radios', name: 'Checks & Radios', element: ChecksRadios },
  { path: '/forms/range', name: 'Range', element: Range },
  { path: '/forms/input-group', name: 'Input Group', element: InputGroup },
  { path: '/forms/floating-labels', name: 'Floating Labels', element: FloatingLabels },
  { path: '/forms/layout', name: 'Layout', element: Layout },
  { path: '/forms/validation', name: 'Validation', element: Validation },
  { path: '/icons', exact: true, name: 'Icons', element: CoreUIIcons },
  { path: '/icons/coreui-icons', name: 'CoreUI Icons', element: CoreUIIcons },
  { path: '/icons/flags', name: 'Flags', element: Flags },
  { path: '/icons/brands', name: 'Brands', element: Brands },
  { path: '/notifications', name: 'Notifications', element: Alerts, exact: true },
  { path: '/notifications/alerts', name: 'Alerts', element: Alerts },
  { path: '/notifications/badges', name: 'Badges', element: Badges },
  { path: '/notifications/modals', name: 'Modals', element: Modals },
  { path: '/notifications/toasts', name: 'Toasts', element: Toasts },
  { path: '/widgets', name: 'Widgets', element: Widgets },
  { path: '/pages', name: 'Pages', element: Settings, exact: true },
  { path: '/pages/settings', name: 'Settings', element: Settings },
]

export default routes
