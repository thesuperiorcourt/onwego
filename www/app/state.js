/* The app's mutable state, in one place. Everything else imports this
   object and reads/writes its properties — never reassigns the binding
   itself, since ES module imports are read-only references to the
   binding (App.S = x works; import{App}; App = x does not). */
export const App = {
  S: null,               // full state
  W: null,                // active world
  view: 'tonight',
  taskUI: { q:'', categories:[], tags:[], streakOnly:false, scope:'all', sort:'date', dir:'asc' },
  lastFocus: null
};
