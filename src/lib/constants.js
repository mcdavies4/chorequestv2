export const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');`

export const GLOBAL_STYLES = `
  ${FONTS}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Nunito', sans-serif; background: #0f172a; }
  @keyframes coinFly { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(var(--dx),var(--dy)) scale(0.3);opacity:0} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideUp { from{transform:translateY(100%);opacity:0} to{transform:translateY(0);opacity:1} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
  .fade-in { animation: fadeIn 0.3s ease forwards; }
  input, button { -webkit-tap-highlight-color: transparent; }
`

export const KID_AVATARS = ['🦊','🐻','🐼','🦁','🐯','🐨','🐸','🦋','🐙','🦄','🐬','🐧']

export const SUGGESTED_CHORES = [
  { title: 'Make Bed',           icon: '🛏️', coins: 0.50 },
  { title: 'Tidy Room',          icon: '🧹', coins: 1.00 },
  { title: 'Feed the Pet',       icon: '🐕', coins: 0.75 },
  { title: 'Set Dinner Table',   icon: '🍽️', coins: 0.50 },
  { title: 'Take Out Trash',     icon: '🗑️', coins: 1.00 },
  { title: 'Wash Dishes',        icon: '🫧', coins: 1.00 },
  { title: 'Vacuum Living Room', icon: '🌀', coins: 1.50 },
  { title: 'Fold Laundry',       icon: '👕', coins: 1.25 },
  { title: 'Unload Dishwasher',  icon: '🥣', coins: 0.75 },
  { title: 'Wipe Counters',      icon: '🧽', coins: 0.50 },
  { title: 'Sweep the Floor',    icon: '🏡', coins: 0.75 },
  { title: 'Water the Plants',   icon: '🪴', coins: 0.50 },
]

export const CHORE_ICONS = ['🛏️','🐕','🧹','🍽️','🗑️','🌀','🫧','👕','🪴','🐱','🚿','🧺','🍳','📚','🚗','🧽']

export const REWARDS = [
  { id:1,  title:'Extra Screen Time', subtitle:'30 min bonus',          icon:'📱', cost:2.00, category:'privileges' },
  { id:2,  title:'Choose Dinner',     subtitle:"Pick tonight's meal",   icon:'🍕', cost:3.00, category:'privileges' },
  { id:3,  title:'Stay Up Late',      subtitle:'30 min past bedtime',   icon:'🌙', cost:4.00, category:'privileges' },
  { id:4,  title:'Skip One Chore',    subtitle:'One free pass',         icon:'🎫', cost:5.00, category:'privileges' },
  { id:5,  title:'Movie Night Pick',  subtitle:'You choose the film',   icon:'🎬', cost:3.50, category:'fun' },
  { id:6,  title:'Ice Cream Trip',    subtitle:'Trip to ice cream shop', icon:'🍦', cost:6.00, category:'fun' },
  { id:7,  title:'Friend Sleepover',  subtitle:'Invite a friend over',  icon:'🛌', cost:8.00, category:'fun' },
  { id:8,  title:'New Book',          subtitle:'Any book under $12',    icon:'📚', cost:5.00, category:'toys' },
  { id:9,  title:'Small Toy',         subtitle:'Toy up to $10',         icon:'🧸', cost:10.00, category:'toys' },
  { id:10, title:'Art Supplies',      subtitle:'Craft kit of choice',   icon:'🎨', cost:7.00, category:'toys' },
]
