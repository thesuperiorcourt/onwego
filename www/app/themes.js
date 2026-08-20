/* ------------------------------- theme packs -------------------------------
   Each pack paints the whole world: sky, ground, what hangs in the sky, and
   what grows. Add a pack here and it shows up everywhere, for every world.  */
export const THEMES = {
  midnight: {
    name: 'Midnight', blurb: 'Suns, moons and stars',
    vars: { '--sky-1':'#0A0720','--sky-2':'#1D1547','--sky-3':'#3B2A6E','--ink':'#EFE9FF','--muted':'#B6A9DE',
            '--glow':'#F3C56B','--bloom':'#F0709E','--leaf':'#63C6A3',
            '--glow-ink':'#F3C56B','--bloom-ink':'#F0709E','--leaf-ink':'#63C6A3',
            '--ground':'#150F33','--ground-2':'#241A55',
            '--card':'rgba(10,7,32,.88)','--edge':'rgba(255,255,255,.16)','--edge-strong':'#6E63A0',
            '--focus':'#F3C56B','--btn-ink':'#241704' },
    sky: { stars: 70, moon: true, sun: 'rising', clouds: 0, motes: 'firefly' },
    canopy: ['#63C6A3','#4FA9E0','#B487F0','#F0709E'], trunk: '#2B1F52', bloomDot: '#F3C56B'
  },
  meadow: {
    name: 'Meadow', blurb: 'Long afternoon, wildflowers',
    vars: { '--sky-1':'#DCEFE0','--sky-2':'#A9DCC8','--sky-3':'#7FC9B7','--ink':'#12291F','--muted':'#3B5A4C',
            '--glow':'#E08A2E','--bloom':'#E2557F','--leaf':'#2F7D5B',
            '--glow-ink':'#8A4A06','--bloom-ink':'#A32450','--leaf-ink':'#17593C',
            '--ground':'#BFE3C4','--ground-2':'#8FCBA4',
            '--card':'rgba(220,239,224,.90)','--edge':'rgba(18,41,31,.20)','--edge-strong':'#4E7060',
            '--focus':'#123B2C','--btn-ink':'#241704' },
    sky: { stars: 0, moon: false, sun: 'high', clouds: 3, motes: 'pollen' },
    canopy: ['#2F7D5B','#4FA06B','#7FBF6A','#E2557F'], trunk: '#5C4326', bloomDot: '#E2557F'
  },
  ember: {
    name: 'Ember', blurb: 'Late autumn, low sun',
    vars: { '--sky-1':'#2A1410','--sky-2':'#5C2418','--sky-3':'#A8471F','--ink':'#FFEBDD','--muted':'#DCA98F',
            '--glow':'#FFC15E','--bloom':'#FF7A5C','--leaf':'#E0913B',
            '--glow-ink':'#FFC15E','--bloom-ink':'#FF8E72','--leaf-ink':'#E8A24E',
            '--ground':'#31160F','--ground-2':'#5A2716',
            '--card':'rgba(42,20,16,.90)','--edge':'rgba(255,235,221,.20)','--edge-strong':'#A06A55',
            '--focus':'#FFC15E','--btn-ink':'#241704' },
    sky: { stars: 12, moon: false, sun: 'setting', clouds: 2, motes: 'ember' },
    canopy: ['#E0913B','#FF7A5C','#C24E2C','#FFC15E'], trunk: '#40201A', bloomDot: '#FFC15E'
  },
  tidewater: {
    name: 'Tidewater', blurb: 'Moon over deep water',
    vars: { '--sky-1':'#04161F','--sky-2':'#0A3244','--sky-3':'#12586B','--ink':'#E4F7FA','--muted':'#9CC8D4',
            '--glow':'#7FE3D6','--bloom':'#7FA9F0','--leaf':'#3FBFA8',
            '--glow-ink':'#7FE3D6','--bloom-ink':'#93B6F5','--leaf-ink':'#4FCDB5',
            '--ground':'#05202B','--ground-2':'#0B3B4A',
            '--card':'rgba(4,22,31,.90)','--edge':'rgba(228,247,250,.20)','--edge-strong':'#5B8C9C',
            '--focus':'#7FE3D6','--btn-ink':'#04161F' },
    sky: { stars: 40, moon: true, sun: 'none', clouds: 0, motes: 'bubble' },
    canopy: ['#3FBFA8','#7FE3D6','#7FA9F0','#B79BE8'], trunk: '#0C3543', bloomDot: '#7FE3D6'
  },
  orchard: {
    name: 'Orchard', blurb: 'Blossom dusk',
    vars: { '--sky-1':'#1A0F26','--sky-2':'#472050','--sky-3':'#8E3F6B','--ink':'#FDEBF3','--muted':'#CDA5BD',
            '--glow':'#FFD1A8','--bloom':'#FF8FB8','--leaf':'#8ED6A8',
            '--glow-ink':'#FFD1A8','--bloom-ink':'#FF9DC1','--leaf-ink':'#8ED6A8',
            '--ground':'#22122C','--ground-2':'#4A2246',
            '--card':'rgba(26,15,38,.90)','--edge':'rgba(253,235,243,.20)','--edge-strong':'#8C6883',
            '--focus':'#FFD1A8','--btn-ink':'#241704' },
    sky: { stars: 26, moon: true, sun: 'setting', clouds: 1, motes: 'petal' },
    canopy: ['#FF8FB8','#FFD1A8','#8ED6A8','#D6A8FF'], trunk: '#3A1E38', bloomDot: '#FFD1A8'
  }
};
