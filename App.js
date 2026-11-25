
import React, {useState, useEffect, useRef} from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Animated, Share, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';

const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

const FONT_SETS = [
  {name:'Bold', map:'𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳'},
  {name:'Italic', map:'𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻'},
  {name:'Bold Italic', map:'𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯'},
  {name:'Script', map:'𝒜ℬ𝒞𝒟ℰℱ𝒢ℋℐ𝒥𝒦ℒℳ𝒩𝒪𝒫𝒬ℛ𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏'},
  {name:'Double', map:'𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫'},
  {name:'Monospace', map:'𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣'},
  {name:'Circled', map:'ⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ'},
  {name:'Squared', map:'🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉'}
];

function transform(value, map) {
  return [...value].map(c => {
    const i = A.indexOf(c);
    return i < 0 ? c : [...map][i] || c;
  }).join('');
}

const BIO_TEMPLATES = [
  {title:'Minimal', text:n=>`${n || 'Your Name'}\nBuilding my own journey\nFocused on growth and creativity.`},
  {title:'Professional', text:n=>`${n || 'Your Name'}\nCreator | Learner | Innovator\nTurning ideas into reality.`},
  {title:'Creative', text:n=>`${n || 'Your Name'}\nCreative mind. Clear vision.\nAlways learning something new.`},
  {title:'Personal', text:n=>`${n || 'Your Name'}\nLiving life on my own terms\nProgress over perfection.`},
  {title:'Student', text:n=>`${n || 'Your Name'}\nStudent | Future Professional\nLearning. Building. Growing.`},
  {title:'Developer', text:n=>`${n || 'Your Name'}\nDeveloper | Technology Enthusiast\nCreating things that matter.`}
];

const NAV = [
  {id:'home', label:'Home', symbol:'⌂'},
  {id:'fonts', label:'Fonts', symbol:'Aa'},
  {id:'bio', label:'Bio Studio', symbol:'B'},
  {id:'saved', label:'Saved', symbol:'☆'}
];

export default function App() {
  const [screen,setScreen] = useState('home');
  const [input,setInput] = useState('');
  const [bioName,setBioName] = useState('');
  const [bioCategory,setBioCategory] = useState('All');
  const [selectedFont,setSelectedFont] = useState('Bold');
  const [favorites,setFavorites] = useState([]);
  const [recent,setRecent] = useState([]);
  const [toast,setToast] = useState('');
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(()=>{
    Promise.all([
      AsyncStorage.getItem('tc_favorites'),
      AsyncStorage.getItem('tc_recent')
    ]).then(([f,r])=>{
      if(f) setFavorites(JSON.parse(f));
      if(r) setRecent(JSON.parse(r));
    }).catch(()=>{});
    Animated.timing(fade,{toValue:1,duration:650,useNativeDriver:true}).start();
  },[]);

  const notify = message=>{
    setToast(message);
    setTimeout(()=>setToast(''),1800);
  };

  const saveData = async (key,value)=>{
    try { await AsyncStorage.setItem(key,JSON.stringify(value)); }
    catch(e) { notify('Could not save data'); }
  };

  const copy = async value=>{
    if(!value?.trim()) return notify('Enter text first');
    await Clipboard.setStringAsync(value);
    notify('Text copied');
    const item={text:value,date:Date.now()};
    const updated=[item,...recent.filter(x=>x.text!==value)].slice(0,30);
    setRecent(updated);
    saveData('tc_recent',updated);
  };

  const toggleFavorite = value=>{
    if(!value?.trim()) return;
    const exists=favorites.some(x=>x.text===value);
    const updated=exists
      ? favorites.filter(x=>x.text!==value)
      : [{text:value,date:Date.now()},...favorites];
    setFavorites(updated);
    saveData('tc_favorites',updated);
    notify(exists?'Removed from favorites':'Added to favorites');
  };

  const share = async value=>{
    if(!value?.trim()) return;
    try { await Share.share({message:value}); } catch(e) {}
  };

  const createBio = template=>template.text(bioName);

  const Header = ({title,sub})=>(
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>TextCraft<Text style={styles.brandDot}>.</Text></Text>
        <Text style={styles.headerSub}>{sub || 'Create something different'}</Text>
      </View>
      <TouchableOpacity style={styles.avatar} onPress={()=>setScreen('about')}>
        <Text style={styles.avatarText}>TC</Text>
      </TouchableOpacity>
    </View>
  );

  const SectionTitle=({children,action,onPress})=>(
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {action && <Text onPress={onPress} style={styles.link}>{action}</Text>}
    </View>
  );

  const ActionButton=({label,onPress,secondary})=>(
    <TouchableOpacity onPress={onPress}
      style={[styles.actionButton,secondary && styles.secondaryButton]}>
      <Text style={[styles.actionText,secondary && styles.secondaryText]}>{label}</Text>
    </TouchableOpacity>
  );

  const FontCard=({font})=>{
    const value=transform(input,font.map);
    const active=selectedFont===font.name;
    const saved=favorites.some(x=>x.text===value);
    return (
      <View style={[styles.fontCard,active && styles.fontActive]}>
        <TouchableOpacity style={{flex:1}} onPress={()=>setSelectedFont(font.name)}>
          <Text style={styles.fontName}>{font.name}</Text>
          <Text style={styles.fontPreview}>{value || 'Your text preview'}</Text>
        </TouchableOpacity>
        <View style={styles.fontActions}>
          <Text onPress={()=>toggleFavorite(value)} style={styles.smallAction}>
            {saved?'★':'☆'}
          </Text>
          <Text onPress={()=>copy(value)} style={styles.copyAction}>COPY</Text>
        </View>
      </View>
    );
  };

  const Home=()=>(
    <>
      <Header sub="Your creative text workspace"/>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>TEXT DESIGN STUDIO</Text>
        <Text style={styles.heroTitle}>Your words.{'\n'}Your style.</Text>
        <Text style={styles.heroSub}>Transform simple text into something unique.</Text>
        <TouchableOpacity style={styles.heroButton} onPress={()=>setScreen('fonts')}>
          <Text style={styles.heroButtonText}>Explore text styles  →</Text>
        </TouchableOpacity>
        <View style={styles.heroDecoration}/>
      </View>

      <SectionTitle>Creative tools</SectionTitle>
      <View style={styles.toolGrid}>
        {[
          ['Aa','Stylish Fonts','fonts'],
          ['B','Bio Studio','bio'],
          ['T','Text Editor','editor'],
          ['☆','Favorites','saved']
        ].map(([symbol,label,target])=>(
          <TouchableOpacity key={target} style={styles.toolCard}
            onPress={()=>setScreen(target)}>
            <Text style={styles.toolSymbol}>{symbol}</Text>
            <Text style={styles.toolLabel}>{label}</Text>
            <Text style={styles.toolArrow}>Open  →</Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionTitle action="View all" onPress={()=>setScreen('saved')}>Recent creations</SectionTitle>
      {recent.length===0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptySub}>Your recent creations will appear here.</Text>
        </View>
      ):recent.slice(0,3).map((x,i)=>(
        <TouchableOpacity key={i} style={styles.recentCard} onPress={()=>copy(x.text)}>
          <Text style={styles.recentText} numberOfLines={2}>{x.text}</Text>
          <Text style={styles.recentHint}>Tap to copy</Text>
        </TouchableOpacity>
      ))}
    </>
  );

  const Fonts=()=>(
    <>
      <Header sub="Stylish text generator"/>
      <Text style={styles.pageTitle}>Font Studio</Text>
      <Text style={styles.pageSub}>Type once. Explore different styles instantly.</Text>
      <Text style={styles.fieldLabel}>YOUR TEXT</Text>
      <TextInput value={input} onChangeText={setInput}
        placeholder="Start typing here..."
        placeholderTextColor="#8995A8" style={styles.mainInput}
        multiline maxLength={300}/>
      <View style={styles.inputMeta}>
        <Text style={styles.metaText}>{input.length} / 300 characters</Text>
        <Text onPress={()=>setInput('')} style={styles.clearText}>Clear</Text>
      </View>
      <SectionTitle>Available styles</SectionTitle>
      {FONT_SETS.map(font=><FontCard key={font.name} font={font}/>)}
    </>
  );

  const Bio=()=>(
    <>
      <Header sub="Create your social profile bio"/>
      <Text style={styles.pageTitle}>Bio Studio</Text>
      <Text style={styles.pageSub}>Create a profile description in seconds.</Text>
      <Text style={styles.fieldLabel}>YOUR NAME</Text>
      <TextInput value={bioName} onChangeText={setBioName}
        placeholder="Enter your name"
        placeholderTextColor="#8995A8" style={styles.mainInput}/>
      <SectionTitle>Choose a category</SectionTitle>
      <View style={styles.categoryRow}>
        {['All','Professional','Creative','Personal'].map(c=>(
          <TouchableOpacity key={c} onPress={()=>setBioCategory(c)}
            style={[styles.category,bioCategory===c && styles.categoryActive]}>
            <Text style={[styles.categoryText,bioCategory===c && styles.categoryTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <SectionTitle>Bio templates</SectionTitle>
      {BIO_TEMPLATES.filter(t=>bioCategory==='All' || t.title===bioCategory || (bioCategory==='Professional' && t.title==='Developer')).map(t=>{
        const value=createBio(t);
        return (
          <View key={t.title} style={styles.bioCard}>
            <Text style={styles.bioTitle}>{t.title}</Text>
            <Text style={styles.bioText}>{value}</Text>
            <View style={styles.bioActions}>
              <Text onPress={()=>copy(value)} style={styles.copyAction}>COPY BIO</Text>
              <Text onPress={()=>share(value)} style={styles.smallAction}>SHARE</Text>
              <Text onPress={()=>toggleFavorite(value)} style={styles.smallAction}>☆ SAVE</Text>
            </View>
          </View>
        );
      })}
    </>
  );

  const Editor=()=>(
    <>
      <Header sub="Simple text editor"/>
      <Text style={styles.pageTitle}>Text Editor</Text>
      <Text style={styles.pageSub}>Write, format and share your text.</Text>
      <TextInput value={input} onChangeText={setInput}
        placeholder="Write anything..."
        placeholderTextColor="#8995A8"
        style={[styles.mainInput,{minHeight:180,textAlignVertical:'top'}]}
        multiline maxLength={2000}/>
      <Text style={styles.metaText}>{input.length} characters</Text>
      <View style={styles.editorActions}>
        <ActionButton label="Copy text" onPress={()=>copy(input)}/>
        <ActionButton label="Share text" secondary onPress={()=>share(input)}/>
      </View>
      <SectionTitle>Quick formatting</SectionTitle>
      {FONT_SETS.slice(0,4).map(f=>(
        <TouchableOpacity key={f.name} style={styles.formatRow}
          onPress={()=>setInput(transform(input,f.map))}>
          <Text style={styles.fontName}>{f.name}</Text>
          <Text style={styles.link}>Apply  →</Text>
        </TouchableOpacity>
      ))}
    </>
  );

  const Saved=()=>{
    const [mode,setMode]=useState('Favorites');
    const data=mode==='Favorites'?favorites:recent;
    return (
      <>
        <Header sub="Your personal text collection"/>
        <Text style={styles.pageTitle}>My Library</Text>
        <View style={styles.categoryRow}>
          {['Favorites','Recent'].map(m=>(
            <TouchableOpacity key={m} onPress={()=>setMode(m)}
              style={[styles.category,mode===m && styles.categoryActive]}>
              <Text style={[styles.categoryText,mode===m && styles.categoryTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {data.length===0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Your library is empty</Text>
            <Text style={styles.emptySub}>Save your favorite creations to find them here.</Text>
          </View>
        ):data.map((x,i)=>(
          <View style={styles.bioCard} key={i}>
            <Text style={styles.bioText}>{x.text}</Text>
            <View style={styles.bioActions}>
              <Text onPress={()=>copy(x.text)} style={styles.copyAction}>COPY</Text>
              <Text onPress={()=>share(x.text)} style={styles.smallAction}>SHARE</Text>
              <Text onPress={()=>toggleFavorite(x.text)} style={styles.smallAction}>REMOVE</Text>
            </View>
          </View>
        ))}
      </>
    );
  };

  const About=()=>(
    <>
      <Header sub="About this application"/>
      <View style={styles.aboutBox}>
        <Text style={styles.aboutBrand}>TextCraft.</Text>
        <Text style={styles.pageTitle}>Made for creativity.</Text>
        <Text style={styles.pageSub}>A simple offline text creation studio.</Text>
        <View style={styles.creditBox}>
          <Text style={styles.fieldLabel}>DEVELOPMENT CREDIT</Text>
          <Text style={styles.creditTitle}>Created by Aryan Digital Solutions</Text>
          <Text style={styles.pageSub}>From Aryan</Text>
        </View>
        <Text style={styles.metaText}>Version 1.0.0</Text>
      </View>
    </>
  );

  const pages={
    home:<Home/>,
    fonts:<Fonts/>,
    bio:<Bio/>,
    editor:<Editor/>,
    saved:<Saved/>,
    about:<About/>
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F6F8FC" barStyle="dark-content"/>
      <Animated.View style={{flex:1,opacity:fade}}>
        <ScrollView key={screen} contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          {pages[screen] || <Home/>}
        </ScrollView>
      </Animated.View>
      {toast!=='' && <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View>}
      <View style={styles.bottomBar}>
        {NAV.map(n=>(
          <TouchableOpacity key={n.id} onPress={()=>setScreen(n.id)}
            style={styles.navItem}>
            <Text style={[styles.navSymbol,screen===n.id && styles.navActive]}>{n.symbol}</Text>
            <Text style={[styles.navLabel,screen===n.id && styles.navActive]}>{n.label}</Text>
            {screen===n.id && <View style={styles.navIndicator}/>}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles=StyleSheet.create({
  container:{flex:1,backgroundColor:'#F6F8FC'},
  content:{paddingHorizontal:19,paddingTop:12,paddingBottom:35},
  header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:24},
  brand:{fontSize:27,fontWeight:'900',color:'#17233B',letterSpacing:-1},
  brandDot:{color:'#4568E8'},
  headerSub:{fontSize:11,color:'#8290A5',marginTop:3},
  avatar:{width:42,height:42,borderRadius:14,backgroundColor:'#E8EDFF',alignItems:'center',justifyContent:'center'},
  avatarText:{fontSize:13,fontWeight:'900',color:'#4568E8'},
  hero:{backgroundColor:'#172B50',borderRadius:23,padding:23,marginBottom:27,overflow:'hidden'},
  eyebrow:{fontSize:10,fontWeight:'900',color:'#AFC3F6',letterSpacing:2},
  heroTitle:{fontSize:36,lineHeight:42,fontWeight:'900',color:'#fff',marginTop:17,letterSpacing:-1},
  heroSub:{fontSize:13,color:'#C2CEE4',marginTop:12,lineHeight:21,maxWidth:'85%'},
  heroButton:{backgroundColor:'#FFFFFF',padding:14,borderRadius:11,alignSelf:'flex-start',marginTop:23},
  heroButtonText:{fontSize:12,fontWeight:'900',color:'#172B50'},
  heroDecoration:{position:'absolute',width:145,height:145,borderRadius:80,borderWidth:25,borderColor:'#2D4775',right:-45,top:40},
  sectionRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:23,marginBottom:14},
  sectionTitle:{fontSize:17,fontWeight:'900',color:'#1D2B44'},
  link:{fontSize:12,color:'#4568E8',fontWeight:'800'},
  toolGrid:{flexDirection:'row',flexWrap:'wrap',gap:11},
  toolCard:{width:'48%',backgroundColor:'#fff',borderRadius:17,padding:16,borderWidth:1,borderColor:'#E9EDF4',minHeight:132},
  toolSymbol:{fontSize:24,fontWeight:'900',color:'#4568E8',marginBottom:12},
  toolLabel:{fontSize:14,fontWeight:'900',color:'#1D2B44'},
  toolArrow:{fontSize:11,color:'#8591A4',marginTop:9},
  empty:{padding:25,backgroundColor:'#fff',borderRadius:16,alignItems:'center',marginTop:12},
  emptyTitle:{fontSize:15,fontWeight:'900',color:'#24324A'},
  emptySub:{fontSize:12,color:'#8591A4',textAlign:'center',marginTop:7,lineHeight:19},
  recentCard:{backgroundColor:'#fff',borderRadius:13,padding:15,marginBottom:10,borderWidth:1,borderColor:'#E9EDF4'},
  recentText:{fontSize:14,color:'#27364F'},
  recentHint:{fontSize:10,color:'#4568E8',marginTop:9,fontWeight:'800'},
  pageTitle:{fontSize:28,fontWeight:'900',color:'#17233B',letterSpacing:-.7},
  pageSub:{fontSize:13,color:'#8390A3',lineHeight:20,marginTop:7,marginBottom:20},
  fieldLabel:{fontSize:10,fontWeight:'900',color:'#748198',letterSpacing:1.2,marginBottom:9},
  mainInput:{backgroundColor:'#fff',borderWidth:1,borderColor:'#E4E9F1',borderRadius:15,padding:16,fontSize:15,color:'#17233B',minHeight:55},
  inputMeta:{flexDirection:'row',justifyContent:'space-between',marginTop:8,marginBottom:9},
  metaText:{fontSize:10,color:'#8995A8'},
  clearText:{fontSize:11,color:'#4568E8',fontWeight:'800'},
  fontCard:{backgroundColor:'#fff',padding:15,borderRadius:15,marginBottom:11,borderWidth:1,borderColor:'#E7EBF3',flexDirection:'row',alignItems:'center',gap:10},
  fontActive:{borderColor:'#4568E8',backgroundColor:'#F9FAFF'},
  fontName:{fontSize:11,fontWeight:'900',color:'#8290A5',marginBottom:8},
  fontPreview:{fontSize:19,color:'#1D2B44'},
  fontActions:{alignItems:'center',gap:15},
  smallAction:{fontSize:12,fontWeight:'900',color:'#4568E8'},
  copyAction:{fontSize:11,fontWeight:'900',color:'#4568E8'},
  categoryRow:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:17},
  category:{backgroundColor:'#fff',borderRadius:10,borderWidth:1,borderColor:'#E4E9F1',paddingHorizontal:13,paddingVertical:10},
  categoryActive:{backgroundColor:'#E8EDFF',borderColor:'#4568E8'},
  categoryText:{fontSize:11,fontWeight:'800',color:'#6D7A90'},
  categoryTextActive:{color:'#4568E8'},
  bioCard:{backgroundColor:'#fff',padding:17,borderRadius:15,borderWidth:1,borderColor:'#E6EAF2',marginBottom:12},
  bioTitle:{fontSize:12,fontWeight:'900',color:'#4568E8',marginBottom:10},
  bioText:{fontSize:15,color:'#24334C',lineHeight:25},
  bioActions:{flexDirection:'row',gap:20,marginTop:17,paddingTop:13,borderTopWidth:1,borderColor:'#EFF1F5'},
  editorActions:{flexDirection:'row',gap:10,marginTop:13},
  actionButton:{flex:1,backgroundColor:'#4568E8',padding:14,borderRadius:11,alignItems:'center'},
  secondaryButton:{backgroundColor:'#E8EDFF'},
  actionText:{color:'#fff',fontSize:12,fontWeight:'900'},
  secondaryText:{color:'#4568E8'},
  formatRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',backgroundColor:'#fff',padding:16,borderRadius:12,marginBottom:9},
  aboutBox:{alignItems:'center',paddingTop:55},
  aboutBrand:{fontSize:39,fontWeight:'900',color:'#4568E8',marginBottom:20},
  creditBox:{width:'100%',padding:22,backgroundColor:'#fff',borderRadius:17,alignItems:'center',marginTop:25,marginBottom:25},
  creditTitle:{fontSize:16,fontWeight:'900',color:'#1D2B44',marginVertical:12,textAlign:'center'},
  bottomBar:{height:67,backgroundColor:'#fff',borderTopWidth:1,borderColor:'#E9EDF3',flexDirection:'row',justifyContent:'space-around',alignItems:'center'},
  navItem:{flex:1,alignItems:'center',justifyContent:'center',height:60,gap:3},
  navSymbol:{fontSize:19,fontWeight:'800',color:'#9AA5B5'},
  navLabel:{fontSize:9,color:'#9AA5B5',fontWeight:'700'},
  navActive:{color:'#4568E8'},
  navIndicator:{position:'absolute',top:0,width:22,height:3,borderRadius:5,backgroundColor:'#4568E8'},
  toast:{position:'absolute',bottom:78,alignSelf:'center',backgroundColor:'#172B50',paddingHorizontal:22,paddingVertical:13,borderRadius:12},
  toastText:{fontSize:12,fontWeight:'800',color:'#fff'}
});
