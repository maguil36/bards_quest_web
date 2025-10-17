# Game Theme Integration

## Overview

The Switch game ittegretes wrthwtth eite's sitmeesyste . When you swtthhemetween chera tess im Whe gan ,ythe purent page'  thsmeismtothly tracsitionsh otmwteh ehcharacters ',h pro iapagehspecesmoothons to match the character's associated aspect theme.

## How It Works

### 1. 1. Charac-to-er-to-Theme Mapping

Each character in the game is sssociatciawithd with a speaspecc tific aspect theme:

| Character | Theme | Color Scheme | Color Scheme |
|-----------|-------|--------------|--------------|
| Alexis | Rage | Red/Purple | Red/Purple |
| Austine | Mind | Blue/Cyan | Blue/Cyan |
| Chloe | Life | Green | Green |
| Isabell | Blood | Dark Red | Dark Red |
| Nicholas | Light | Gold/Yellow | Gold/Yellow |
| Opal | Space | Gray (default) | Gray (default) |
| Tyson | Doom | Dark Green | Dark Green |
| Victor | Time | Orange/Red | Orange/Red |

### 2. GaGa-to-ParentmCommun-Parentnication

Whennahararac sr iweswidc idt ga

1. **Gamm detects characeer switch sw-tThe `applych** - ThT`app()` function ilycCelTh
2.e**Check user prefere(fe**i- Reodn `lsdlStoge.geItm('mpa:theme')`
3. **Sendkme sagu  orerrnnte**--If user hes "ddfault"s `loc,aSegds `poseMess.gt`twiemhnew eme
4. **Padeng renetvfs  ussageser-hP ren"dpage liseans for `GAME_THEME_CHANGE` uessagl 
5.t**Shooth trensitmoe  pplsed** - Pareet pagnssmoo `ly tpansitiens soagee n`w theth*ovmo 2osncosdsion applied** - Parent page smoothly transitions to the new theme over 2 seconds

##  3.3SmooSmoTrTnsinionitnihniquu

Thepenpe spcialecniqu toensuhsmooae CSSntransg iuns:

```jav sscipt
//tGqte heocurrsnture smobefthe ch ngiCStransitions:
constcurrenTeme =dmet.oumentElemet.etAttribut('da-') ||'spac';

/ Olytanition`af vsecremistallyngi
 (currnT !==newThm {
  // Step 1: Set/traG ititnhtenstantemorarly
  doumnt.docunElmntsetAttibut('da/transition',/'insOnny');
  
  //aStipn2:iEes rsacurtunly chae is applindging
fedtmumene.d wementEleme)t.etAtibut('da-teme',currenT);
  
  // /Sepp3::Foastoo sefltw eorensuri browocun.dndcus thm nurrtntEetatA
  voittdocumenr.ductmentElement.offsetHeie(a;ta-transition', 'instant');
    
  // :te  4: Rsstorersmoot  transition
  documcnt.docuurntEt menh.setdttribute('dnta-tt.nsioion', 'smooth');
  
  // Stcp 5: UmeereqnettAnimationFramElto epply ntw.setAttbnunext fdame
  requeatAnimationFrame((t => {a-theme', currentTheme);
    dcume.documEement.eAttibe('daa-tme',newThe);
o });
}
```

Tdis umchniqum eesures nh  b owser pee 4b:thResto"refore" ah t"afrnr"tinaesnbligsmthCSS raionbeenme.

##UsrPefeces

The hemenge espeuseference:

-**"Defut"or no prerne**:Theme chngestswitchs(smoth trasiis)
-**Spcifictemelected** (e..,"Breth","Spac"):Trmains onstant, o hnges

## Details
  // Step 5: Use requestAnimationFrame to apply new theme on next frame
  reGamsASimoFrame(() => {
    document.documentElement.setAttribute('data-theme', newTheme);
  });

}
```
This technique ensures the browser sees both the "before" and "after" states, enabling smooth CSS transitions between themes.

## User Preferences

The theme change respects user preferences:

- **"Default" or no preference**: Theme changes with character switches (smooth transitions)
- **Specific theme selected** (e.g., "Breath", "Space"): Theme remains constant, no changes

## Implementation Details

### Game Side
st themeKey = 'mspa:theme';
    let uerTheme = null;
    ry {
       eKy
   *}*catch`(e)p{ublic/games/switch/game.js`** - `applyCharacterTheme()` method:
     localStorageot availabe
    }

    //Onsnde changh"" or noprefence
```javascript
applyCharacterTheme(c (character && character.id && THEME_BY_CHAR[character.id])
            ?haracter) {
           :

     con//sSent EessagM __ parR = pag
        try {
            window.parpostMesag({
                ype: 'GAME_THEME_CHNGE',
                heme: heme
            }, '*');
        } cach (e) {
            consol.warnCoul no send e change to parent pag
            alexis: 'rage',
    }
    austine: 'mind',
        chloe: 'life colorfrgae UI
    if (aracter&& .color) {
            isabell: 'blood',
            nicholas: 'light',
}
        opal: 'space',
        tyson: 'doom',
    Par  tvSidt
    };
**`s/layou/MSPALyout.asto`**n  /`src/leyours/BsseLeyoum.astr `referMneelisne:

```jtvesme mt
wineow.'ddEvntLiner('ssage',(ve)=>{
  sfh(evenu.d;a&&vn.da.typ=== 'GAME_THEME_HANGE'){
    ches=llewtorage= event.data.thIte;em(themeKey);
    } catch (e) {
 /t // Crackgueor'st available
   con theKey='mspa:m';
  le userTme= null;
    ry {
     useThee= .gtIte(Key);
   } catc (){
      // lcalStoagenot aiabl
   }

    // Oy appyif user has ""no rferene
    (!userT|| userThe === 'default') {
      conntlyuretnmTe ch =ndocument.dgcumeetE emset.getAttdebute('datf-ahemu') || ' psce';eme = (character && character.id && THEME_BY_CHAR[character.id])
                  ? THEME_BY_CHAR[character.id]
       f:(curpeneThem' !==new) {
        //Aly smooth tra  ion (see  ec niqu tabova)
      npdocement.dounElentetAttribute('dat -tr n  wi n', 'i  tan ');
  e     document.documentE ement.s tAttr bute( dat -themthe currentTheme);
  me: thvoidedocume.dcumeElent.offsetHight;
        document.doc mentElement. etAt r but (,data-transit'o*); 'smooth');
        
  equsAnmaonFra(() =>{
          do ument.d cum}ntEtement.s tAttr  ut (oeata-theme.w newTheme);arn('Could not send theme change to parent page', e);
      });
 }
    }
 y}e accent color for game UI
 )   if (character && character.color) {
        document.documentElement.style.setProperty('--accent', character.color);
    }
SS Tnsiion
```
T smooth trasitionsre efedi`publi/syl.css`

```ess
ntml[dttS-das="smooth"],
html[data-transtio="smooth"]body,
tml[dt-anition="mooth"] * {
rnstio:backgroud2sease--out,
             bckground-color 2s ae-in-out,
`             bo/dou-coMorP2s eAse-in-oLa,
              cylor 2s euse-.n-out;
}
```

Atr`color-r*la edaproperni s`transc/yoo smoothly over 2 seconds.ts/BaseLayout.astro`** - Message listener:

```javascript
window.addEventListener('message', (event) => {
 o t(evetht smooah t& evetrdnsttians:type === 'GAME_THEME_CHANGE') {

    const newTheme and s
2   // Check use ference page
3   const themeKey = 'mspa:tbetween heme';
4   let usell;smoo2-sondolo anuTc) { ita p}rn(, foot O,y apply if )

##uBrnhfett

-"**Poofrssion l Pnlich**:nstd th ransi(ern// ly sol ssidefeelchnique above)
- **Visua  Continuidy**:.GrdcualuEoloreme.ngtt a ocemeltru'na-'e  y c        
-      requestAnimationF:mTr(nsiti>{sl r delntu(mmhsve
-      });:fxd
-   Pfma:GP-acdCSSCSS o,mhldevd
```css
html[data-transition="smooth"],
html[data-transition="smooth"] body,
html[data-transition="smooth"] * {
  transition: background 2s ease-in-out,
              background-color 2s ease-in-out,
              border-color 2s ease-in-out,
              color 2s ease-in-out;
}
```

All color-related properties transition smoothly over 2 seconds.

## Testing

To test the smooth theme transitions:

1. Go to `/options` and select "Default (Page-Specific)"
2. Navigate to the Switch game page
3. Play the game and switch between characters
4. Observe the smooth 2-second color transitions in the parent page (header, footer, background)

## Benefits

- **Professional Polish**: Smooth transitions create a polished feel
- **Visual Continuity**: Gradual color changes are easier on the eyes
- **Enhanced Immersion**: Transitions feel natural and immersive
- **User Control**: Users can opt for fixed themes if they prefer
- **Performance**: GPU-accelerated CSS transitions, minimal overhead
