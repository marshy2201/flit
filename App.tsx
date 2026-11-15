import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
type Property = {
  id: number;
  title: string;
  area: string;
  price: string;
  beds: number;
  baths: number;
  type: string;
  tag: string;
  image: string;
  description: string;
  liked?: boolean;
};
const initialProperties: Property[] = [
  {
    id: 1,
    title: 'A home with a little more space',
    area: 'Swanland, East Yorkshire',
    price: '£325,000',
    beds: 4,
    baths: 2,
    type: 'Detached',
    tag: 'JUST LISTED',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
    description:
      'A bright, modern family home with an open-plan kitchen, landscaped garden and driveway parking.',
  },
  {
    id: 2,
    title: 'Character, charm & city living',
    area: 'The Avenues, Hull',
    price: '£189,950',
    beds: 3,
    baths: 1,
    type: 'Terraced',
    tag: 'GREAT LOCATION',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
    description:
      'A beautifully presented period home close to independent cafés, green spaces and the city centre.',
  },
  {
    id: 3,
    title: 'Your own slice of the coast',
    area: 'Hessle, East Yorkshire',
    price: '£245,000',
    beds: 3,
    baths: 2,
    type: 'Semi-detached',
    tag: 'PRICE REDUCED',
    image: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200',
    description:
      'A welcoming home with generous living space, a private rear garden and excellent transport links.',
  },
  {
    id: 4,
    title: 'A smart place to start',
    area: 'Beverley, East Yorkshire',
    price: '£145,000',
    beds: 2,
    baths: 1,
    type: 'Apartment',
    tag: 'FIRST HOME',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200',
    description:
      'A stylish apartment finished to a high standard, moments from Beverley town centre.',
  },
];
const C = {
  ink: '#172A2A',
  muted: '#788483',
  green: '#C8F169',
  paper: '#F7F6F2',
  white: '#FFFFFF',
  line: '#E8EAE4',
  red: '#E87570',
};
const { width: SCREEN_W } = Dimensions.get('window');
export default function App() {
  const [tab, setTab] = useState('Discover');
  const [properties, setProperties] = useState(initialProperties);
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<number[]>([]);
  const [matches, setMatches] = useState<number[]>([]);
  const [filter, setFilter] = useState('All homes');
  const [selected, setSelected] = useState<Property | null>(null);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState<string[]>(['Hi! Is the property still available to view?']);
  const [showFilters, setShowFilters] = useState(false);
  const [sellerMode, setSellerMode] = useState(false);
  const current = properties[index % properties.length];
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // Rotate the property card as it is dragged, like a dating-app card.
  const cardRotation = pan.x.interpolate({
    inputRange: [-SCREEN_W, 0, SCREEN_W],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  // Fade the LIKE / NOPE labels in as the card moves in either direction.
  const likeOpacity = pan.x.interpolate({
    inputRange: [0, 70, 150],
    outputRange: [0, 0.45, 1],
    extrapolate: 'clamp',
  });
  const dislikeOpacity = pan.x.interpolate({
    inputRange: [-150, -70, 0],
    outputRange: [1, 0.45, 0],
    extrapolate: 'clamp',
  });

  // Highlight the matching action button while the user is dragging.
  const likeButtonScale = pan.x.interpolate({
    inputRange: [0, 130, 220],
    outputRange: [1, 1.12, 1.18],
    extrapolate: 'clamp',
  });
  const dislikeButtonScale = pan.x.interpolate({
    inputRange: [-220, -130, 0],
    outputRange: [1.18, 1.12, 1],
    extrapolate: 'clamp',
  });
  const likeButtonColor = pan.x.interpolate({
    inputRange: [0, 100],
    outputRange: [C.white, C.green],
    extrapolate: 'clamp',
  });
  const dislikeButtonColor = pan.x.interpolate({
    inputRange: [-100, 0],
    outputRange: ['#FCE5E3', C.white],
    extrapolate: 'clamp',
  });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8,
        onPanResponderMove: (_, gesture) => {
          pan.setValue({ x: gesture.dx, y: gesture.dy * 0.25 });
        },
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx > 100) {
            swipe('like');
          } else if (gesture.dx < -100) {
            swipe('pass');
          } else {
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
              friction: 6,
            }).start();
          }
        },
      }),
    [index, properties],
  );

  function swipe(action: 'like' | 'pass' | 'super') {
    if (!current) return;

    const direction = action === 'pass' ? -1 : 1;

    // Animate the card off-screen before showing the next property.
    Animated.timing(pan, {
      toValue: { x: direction * SCREEN_W * 1.3, y: 0 },
      duration: 190,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (!finished) return;

      if (action !== 'pass') {
        setLiked((value) => (value.includes(current.id) ? value : [...value, current.id]));

        if (action === 'super' || current.id % 2 === 1) {
          setMatches((value) => (value.includes(current.id) ? value : [...value, current.id]));
        }
      }

      setIndex((value) => value + 1);
      pan.setValue({ x: 0, y: 0 });
    });
  }
  function openProperty(p: Property) {
    setSelected(p);
  }
  const likedProperties = properties.filter((p) => liked.includes(p.id));
  const matchedProperties = properties.filter((p) => matches.includes(p.id));
  const TabButton = ({ name, icon }: { name: string; icon: string }) => (
    <Pressable
      style={styles.tab}
      onPress={() => {
        setTab(name);
        setSelected(null);
      }}
    >
      <Text style={[styles.tabIcon, { color: tab === name ? C.ink : C.muted }]}>{icon}</Text>
      <Text
        style={[
          styles.tabText,
          { color: tab === name ? C.ink : C.muted, fontWeight: tab === name ? '800' : '500' },
        ]}
      >
        {name}
      </Text>
      <View style={[styles.tabDot, { backgroundColor: tab === name ? C.green : 'transparent' }]} />
    </Pressable>
  );
  const Header = ({ subtitle }: { subtitle: string }) => (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>
          FLIT<Text style={{ color: '#8BBE3F' }}>.</Text>
        </Text>
        <Text style={styles.headerSub}>{subtitle}</Text>
      </View>
      <Pressable style={styles.avatar} onPress={() => setTab('Profile')}>
        <Text style={styles.avatarText}>J</Text>
      </Pressable>
    </View>
  );
  const PropertyCard = ({ p, compact = false }: { p: Property; compact?: boolean }) => (
    <Pressable
      style={[styles.listCard, compact && { width: SCREEN_W * 0.72 }]}
      onPress={() => openProperty(p)}
    >
      <Image source={{ uri: p.image }} style={styles.listImage} />
      <View style={styles.listInfo}>
        <Text style={styles.eyebrow}>{p.tag}</Text>
        <Text style={styles.listTitle}>{p.title}</Text>
        <Text style={styles.muted}>{p.area}</Text>
        <Text style={styles.listPrice}>{p.price}</Text>
        <Text style={styles.muted}>
          {p.beds} beds · {p.baths} baths · {p.type}
        </Text>
      </View>
    </Pressable>
  );
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      {selected ? (
        <>
          <View style={styles.detailTop}>
            <Pressable onPress={() => setSelected(null)} style={styles.back}>
              <Text style={styles.backText}>‹ Back</Text>
            </Pressable>
            <Text style={styles.detailBrand}>FLIT.</Text>
            <View style={{ width: 55 }} />
          </View>
          <ScrollView>
            <Image source={{ uri: selected.image }} style={styles.detailImage} />
            <View style={styles.detailBody}>
              <Text style={styles.eyebrow}>{selected.tag}</Text>
              <Text style={styles.detailTitle}>{selected.title}</Text>
              <Text style={styles.muted}>{selected.area}</Text>
              <Text style={styles.detailPrice}>{selected.price}</Text>
              <View style={styles.stats}>
                <Text style={styles.stat}>{selected.beds} beds</Text>
                <Text style={styles.stat}>{selected.baths} baths</Text>
                <Text style={styles.stat}>{selected.type}</Text>
              </View>
              <Text style={styles.sectionTitle}>The details</Text>
              <Text style={styles.bodyCopy}>{selected.description}</Text>
              <Text style={styles.sectionTitle}>Why you'll love it</Text>
              <Text style={styles.bodyCopy}>
                Light-filled living spaces · Great local amenities · A place to make your own
              </Text>
              <Pressable
                style={styles.primaryButton}
                onPress={() => {
                  if (!liked.includes(selected.id)) setLiked((v) => [...v, selected.id]);
                  if (!matches.includes(selected.id)) setMatches((v) => [...v, selected.id]);
                  setSelected(null);
                  setTab('Matches');
                }}
              >
                <Text style={styles.primaryButtonText}>♡ I'm interested</Text>
              </Pressable>
            </View>
          </ScrollView>
        </>
      ) : (
        <>
          {tab === 'Discover' && (
            <>
              <Header subtitle="Find a place to fall for." />
              <View style={styles.discoverTop}>
                <Text style={styles.pageTitle}>Discover</Text>
                <Pressable style={styles.filterButton} onPress={() => setShowFilters((v) => !v)}>
                  <Text style={styles.filterText}>☷ Filters</Text>
                </Pressable>
              </View>
              {showFilters && (
                <View style={styles.filterPanel}>
                  <Text style={styles.filterHeading}>I'm looking for</Text>
                  <View style={styles.chips}>
                    {['All homes', 'For sale', 'To rent'].map((x) => (
                      <Pressable
                        key={x}
                        onPress={() => setFilter(x)}
                        style={[styles.chip, filter === x && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, filter === x && styles.chipTextActive]}>
                          {x}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={styles.filterHint}>Demo filters · More options coming soon</Text>
                </View>
              )}
              <View style={styles.swipeArea}>
                {index < properties.length ? (
                  <>
                    <View style={styles.cardCount}>
                      <Text style={styles.muted}>A few places picked for you</Text>
                      <Text style={styles.muted}>
                        {index + 1} / {properties.length}
                      </Text>
                    </View>
                    <Animated.View
                      style={[
                        styles.swipeCard,
                        {
                          transform: [...pan.getTranslateTransform(), { rotate: cardRotation }],
                        },
                      ]}
                      {...panResponder.panHandlers}
                    >
                      <Image source={{ uri: current.image }} style={styles.heroImage} />
                      <View style={styles.imageShade} />
                      <Animated.View
                        pointerEvents="none"
                        style={[styles.swipeStamp, styles.likeStamp, { opacity: likeOpacity }]}
                      >
                        <Text style={[styles.swipeStampText, styles.likeStampText]}>LIKE</Text>
                      </Animated.View>
                      <Animated.View
                        pointerEvents="none"
                        style={[
                          styles.swipeStamp,
                          styles.dislikeStamp,
                          { opacity: dislikeOpacity },
                        ]}
                      >
                        <Text style={[styles.swipeStampText, styles.dislikeStampText]}>NOPE</Text>
                      </Animated.View>
                      <View style={styles.photoTag}>
                        <Text style={styles.photoTagText}>{current.tag}</Text>
                      </View>
                      <View style={styles.cardContent}>
                        <Text style={styles.heroPrice}>{current.price}</Text>
                        <Text style={styles.heroTitle}>{current.title}</Text>
                        <Text style={styles.heroArea}>{current.area}</Text>
                        <View style={styles.heroStats}>
                          <Text style={styles.heroStat}>{current.beds} beds</Text>
                          <Text style={styles.heroStat}>{current.baths} baths</Text>
                          <Text style={styles.heroStat}>{current.type}</Text>
                        </View>
                        <Pressable onPress={() => openProperty(current)}>
                          <Text style={styles.detailsLink}>View property details ↗</Text>
                        </Pressable>
                      </View>
                    </Animated.View>
                    <View style={styles.actions}>
                      <Animated.View
                        style={[
                          styles.actionCircle,
                          { borderColor: '#F0B9B5', backgroundColor: dislikeButtonColor },
                          { transform: [{ scale: dislikeButtonScale }] },
                        ]}
                      >
                        <Pressable style={styles.actionPressable} onPress={() => swipe('pass')}>
                          <Text style={{ fontSize: 27, color: C.red }}>×</Text>
                        </Pressable>
                      </Animated.View>
                      <Pressable
                        style={[styles.actionCircle, styles.superCircle]}
                        onPress={() => swipe('super')}
                      >
                        <Text style={{ fontSize: 23, color: '#8B78D6' }}>★</Text>
                      </Pressable>
                      <Animated.View
                        style={[
                          styles.actionCircle,
                          styles.likeCircle,
                          { backgroundColor: likeButtonColor },
                          { transform: [{ scale: likeButtonScale }] },
                        ]}
                      >
                        <Pressable style={styles.actionPressable} onPress={() => swipe('like')}>
                          <Text style={{ fontSize: 25, color: C.ink }}>♥</Text>
                        </Pressable>
                      </Animated.View>
                    </View>
                    <Text style={styles.swipeHint}>
                      Swipe right to show interest · left to pass
                    </Text>
                  </>
                ) : (
                  <View style={styles.empty}>
                    <Text style={styles.emptyEmoji}>⌂</Text>
                    <Text style={styles.emptyTitle}>You're all caught up</Text>
                    <Text style={styles.muted}>You've seen all the demo properties.</Text>
                    <Pressable style={styles.primaryButton} onPress={() => setIndex(0)}>
                      <Text style={styles.primaryButtonText}>Start again</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </>
          )}
          {tab === 'Saved' && (
            <>
              <Header subtitle="The ones that caught your eye." />
              <Text style={styles.pageTitle}>Your shortlist</Text>
              <Text style={styles.pageIntro}>Places you've shown interest in.</Text>
              {likedProperties.length ? (
                <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
                  {likedProperties.map((p) => (
                    <PropertyCard key={p.id} p={p} />
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.empty}>
                  <Text style={styles.emptyEmoji}>♡</Text>
                  <Text style={styles.emptyTitle}>Nothing saved just yet</Text>
                  <Text style={styles.muted}>Swipe right on a home to add it here.</Text>
                </View>
              )}
            </>
          )}
          {tab === 'Matches' && (
            <>
              <Header subtitle="It's a match." />
              <Text style={styles.pageTitle}>Your matches</Text>
              <Text style={styles.pageIntro}>
                When a seller responds to your interest, the conversation starts here.
              </Text>
              {matchedProperties.length ? (
                <ScrollView>
                  {matchedProperties.map((p) => (
                    <Pressable
                      key={p.id}
                      style={styles.matchRow}
                      onPress={() => setTab('Messages')}
                    >
                      <Image source={{ uri: p.image }} style={styles.matchImage} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.matchTitle}>{p.area}</Text>
                        <Text style={styles.muted}>{p.price} · Seller has accepted</Text>
                        <Text style={styles.matchBadge}>IT'S A MATCH</Text>
                      </View>
                      <Text style={styles.chevron}>›</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.empty}>
                  <Text style={styles.emptyEmoji}>✦</Text>
                  <Text style={styles.emptyTitle}>Your next chapter starts here</Text>
                  <Text style={styles.muted}>Show a property some interest to get started.</Text>
                </View>
              )}
            </>
          )}
          {tab === 'Messages' && (
            <>
              <Header subtitle="Get to know your next home." />
              <Text style={styles.pageTitle}>Messages</Text>
              <View style={styles.chatCard}>
                <View style={styles.chatHead}>
                  <View style={styles.chatAvatar}>
                    <Text style={styles.chatAvatarText}>S</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.matchTitle}>Sarah · Property owner</Text>
                    <Text style={styles.muted}>The Avenues, Hull</Text>
                  </View>
                  <View style={styles.online} />
                </View>
                <View style={styles.chatMessages}>
                  <View style={styles.received}>
                    <Text style={styles.chatText}>
                      Hi! Thanks for your interest. Happy to answer any questions or arrange a
                      viewing.
                    </Text>
                  </View>
                  {sent.map((s, i) => (
                    <View key={i} style={styles.sent}>
                      <Text style={styles.sentText}>{s}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.messageInput}>
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Write a message..."
                    placeholderTextColor="#9AA3A0"
                    style={styles.input}
                  />
                  <Pressable
                    onPress={() => {
                      if (message.trim()) {
                        setSent((v) => [...v, message.trim()]);
                        setMessage('');
                      }
                    }}
                    style={styles.send}
                  >
                    <Text style={styles.sendText}>↑</Text>
                  </Pressable>
                </View>
              </View>
              <Text style={styles.demoNote}>
                Sample conversation · Messages aren't sent anywhere
              </Text>
            </>
          )}
          {tab === 'Profile' && (
            <>
              <Header subtitle="A better way to find your place." />
              <Text style={styles.pageTitle}>Your FLIT profile</Text>
              <Pressable
                style={{
                  marginHorizontal: 22,
                  marginTop: 12,
                  backgroundColor: C.ink,
                  padding: 13,
                  borderRadius: 13,
                  alignItems: 'center',
                }}
                onPress={() => setSellerMode((v) => !v)}
              >
                <Text style={{ color: C.green, fontWeight: '900', fontSize: 12 }}>
                  {sellerMode ? 'Switch to buyer profile' : 'Preview seller dashboard  →'}
                </Text>
              </Pressable>
              {sellerMode ? (
                <View style={{ paddingHorizontal: 22, paddingTop: 17 }}>
                  <Text style={styles.sectionTitle}>Seller dashboard</Text>
                  <Text style={styles.muted}>Your properties · 2 active listings</Text>
                  {properties.slice(0, 2).map((p, i) => (
                    <View key={p.id} style={styles.serviceRow}>
                      <Image
                        source={{ uri: p.image }}
                        style={{ width: 58, height: 58, borderRadius: 10 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.matchTitle}>{p.area}</Text>
                        <Text style={styles.muted}>
                          {p.price} · {i === 0 ? '3 interests' : '1 interest'}
                        </Text>
                        <Text style={styles.matchBadge}>LISTING ACTIVE</Text>
                      </View>
                    </View>
                  ))}
                  <Text style={styles.sectionTitle}>Incoming interest</Text>
                  <View style={styles.chatCard}>
                    <View style={{ padding: 15 }}>
                      <Text style={styles.matchTitle}>Alex Morgan is interested</Text>
                      <Text style={styles.muted}>Interested in your property in Swanland</Text>
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 15 }}>
                        <Pressable
                          style={[styles.primaryButton, { marginTop: 0, flex: 1 }]}
                          onPress={() => {
                            setMatches((v) => (v.includes(1) ? v : [...v, 1]));
                            setTab('Matches');
                            setSellerMode(false);
                          }}
                        >
                          <Text style={styles.primaryButtonText}>Accept interest</Text>
                        </Pressable>
                        <Pressable
                          style={{ padding: 13, justifyContent: 'center' }}
                          onPress={() => {}}
                        >
                          <Text style={{ fontSize: 11, color: C.muted, fontWeight: '700' }}>
                            Decline
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.demoNote}>
                    Seller tools are illustrative · No real listing is published
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.profileCard}>
                    <View style={styles.profileAvatar}>
                      <Text style={styles.profileInitial}>J</Text>
                    </View>
                    <Text style={styles.profileName}>Jamie Taylor</Text>
                    <Text style={styles.muted}>Property seeker · Hull</Text>
                    <View style={styles.verified}>
                      <Text style={styles.verifiedText}>✓ Demo verified profile</Text>
                    </View>
                  </View>
                  <Text style={styles.sectionTitle}>Your property journey</Text>
                  {[
                    ['⌕', 'Mortgage advice', 'Explore your borrowing options'],
                    ['⌂', 'Legal support', 'Find a conveyancing solicitor'],
                    ['⌖', 'Home valuation', 'Understand what your home could be worth'],
                  ].map(([ic, t, d]) => (
                    <Pressable key={t} style={styles.serviceRow}>
                      <Text style={styles.serviceIcon}>{ic}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.matchTitle}>{t}</Text>
                        <Text style={styles.muted}>{d}</Text>
                      </View>
                      <Text style={styles.chevron}>›</Text>
                    </Pressable>
                  ))}
                  <Text style={styles.demoNote}>
                    FLIT demo · Profile and verification are illustrative only
                  </Text>
                </>
              )}
            </>
          )}
          <View style={styles.bottomTabs}>
            <TabButton name="Discover" icon="⌕" />
            <TabButton name="Saved" icon="♡" />
            <TabButton name="Matches" icon="✦" />
            <TabButton name="Messages" icon="▤" />
            <TabButton name="Profile" icon="◯" />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper, paddingTop: StatusBar.currentHeight || 0 },
  header: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { fontSize: 30, fontWeight: '900', letterSpacing: 2, color: C.ink },
  headerSub: { fontSize: 12, color: C.muted, marginTop: 1 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontWeight: '800', fontSize: 16, color: C.ink },
  pageTitle: { fontSize: 29, fontWeight: '800', color: C.ink, paddingHorizontal: 22, marginTop: 8 },
  pageIntro: {
    fontSize: 13,
    color: C.muted,
    paddingHorizontal: 22,
    marginTop: 5,
    marginBottom: 15,
    lineHeight: 19,
  },
  discoverTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 22,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterText: { fontSize: 12, fontWeight: '700', color: C.ink },
  filterPanel: {
    marginHorizontal: 22,
    marginTop: 12,
    padding: 14,
    backgroundColor: C.white,
    borderRadius: 16,
  },
  filterHeading: { fontWeight: '800', color: C.ink },
  chips: { flexDirection: 'row', gap: 7, marginTop: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, backgroundColor: C.paper },
  chipActive: { backgroundColor: C.ink },
  chipText: { fontSize: 11, color: C.ink },
  chipTextActive: { color: C.white },
  filterHint: { fontSize: 10, color: C.muted, marginTop: 9 },
  swipeArea: { flex: 1, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6 },
  cardCount: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 },
  muted: { fontSize: 12, color: C.muted },
  swipeCard: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: C.white,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.09,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
  },
  heroImage: { width: '100%', height: '58%', resizeMode: 'cover' },
  imageShade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '58%',
    backgroundColor: 'rgba(0,0,0,0.07)',
  },
  photoTag: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: C.green,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 5,
  },
  photoTagText: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: C.ink },
  cardContent: { paddingHorizontal: 19, paddingTop: 13, flex: 1 },
  heroPrice: { fontSize: 24, fontWeight: '900', color: C.ink },
  heroTitle: { fontSize: 18, fontWeight: '800', color: C.ink, marginTop: 3 },
  heroArea: { fontSize: 12, color: C.muted, marginTop: 4 },
  heroStats: { flexDirection: 'row', gap: 8, marginTop: 12 },
  heroStat: {
    fontSize: 10,
    color: C.ink,
    backgroundColor: C.paper,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    overflow: 'hidden',
  },
  detailsLink: { fontSize: 11, fontWeight: '800', color: C.ink, marginTop: 13 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 22,
    paddingTop: 13,
  },
  actionCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  actionPressable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeStamp: {
    position: 'absolute',
    top: 34,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  likeStamp: { left: 22, borderColor: C.green, transform: [{ rotate: '-12deg' }] },
  dislikeStamp: { right: 22, borderColor: C.red, transform: [{ rotate: '12deg' }] },
  swipeStampText: { fontSize: 25, fontWeight: '900', letterSpacing: 2 },
  likeStampText: { color: C.green },
  dislikeStampText: { color: C.red },
  superCircle: { width: 43, height: 43, borderColor: '#D9D1F3' },
  likeCircle: { width: 58, height: 58, backgroundColor: C.green, borderColor: C.green },
  swipeHint: { fontSize: 10, color: C.muted, textAlign: 'center', paddingTop: 8, paddingBottom: 4 },
  bottomTabs: {
    height: 67,
    borderTopWidth: 1,
    borderTopColor: C.line,
    backgroundColor: C.white,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: { alignItems: 'center', justifyContent: 'center', flex: 1, height: '100%' },
  tabIcon: { fontSize: 20, height: 24 },
  tabText: { fontSize: 9, marginTop: 1 },
  tabDot: { width: 4, height: 4, borderRadius: 2, marginTop: 3 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 35 },
  emptyEmoji: { fontSize: 44, color: '#A7C77A', marginBottom: 10 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.ink, marginBottom: 7 },
  primaryButton: {
    backgroundColor: C.green,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 22,
  },
  primaryButtonText: { fontSize: 13, fontWeight: '900', color: C.ink },
  listCard: {
    marginHorizontal: 22,
    marginTop: 14,
    backgroundColor: C.white,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: C.line,
  },
  listImage: { height: 155, width: '100%' },
  listInfo: { padding: 14 },
  eyebrow: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: '#719B36' },
  listTitle: { fontSize: 17, fontWeight: '800', color: C.ink, marginTop: 5 },
  listPrice: { fontSize: 18, fontWeight: '900', color: C.ink, marginTop: 8, marginBottom: 4 },
  detailTop: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  back: { width: 60 },
  backText: { fontSize: 13, fontWeight: '700', color: C.ink },
  detailBrand: { fontSize: 19, fontWeight: '900', letterSpacing: 2, color: C.ink },
  detailImage: { width: '100%', height: 280 },
  detailBody: { padding: 22 },
  detailTitle: { fontSize: 25, fontWeight: '900', color: C.ink, marginTop: 6 },
  detailPrice: { fontSize: 25, fontWeight: '900', color: C.ink, marginTop: 13 },
  stats: { flexDirection: 'row', gap: 8, marginTop: 12, marginBottom: 14 },
  stat: {
    backgroundColor: C.white,
    borderRadius: 9,
    padding: 10,
    color: C.ink,
    fontSize: 11,
    fontWeight: '700',
    overflow: 'hidden',
  },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: C.ink, marginTop: 19, marginBottom: 8 },
  bodyCopy: { fontSize: 13, lineHeight: 21, color: '#596563' },
  matchRow: {
    marginHorizontal: 22,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: C.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  matchImage: { width: 66, height: 66, borderRadius: 12 },
  matchTitle: { fontSize: 13, fontWeight: '800', color: C.ink },
  matchBadge: { fontSize: 9, fontWeight: '900', letterSpacing: 1, color: '#719B36', marginTop: 7 },
  chevron: { fontSize: 24, color: C.muted },
  chatCard: {
    margin: 20,
    backgroundColor: C.white,
    borderRadius: 18,
    overflow: 'hidden',
    flex: 0.85,
    borderWidth: 1,
    borderColor: C.line,
  },
  chatHead: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderColor: C.line,
  },
  chatAvatar: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: '#E9E4D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarText: { fontSize: 16, fontWeight: '800', color: C.ink },
  online: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#7BBE54' },
  chatMessages: { padding: 13, gap: 12, flex: 1 },
  received: {
    alignSelf: 'flex-start',
    maxWidth: '85%',
    backgroundColor: C.paper,
    padding: 12,
    borderRadius: 14,
    borderBottomLeftRadius: 3,
  },
  chatText: { fontSize: 12, color: C.ink, lineHeight: 18 },
  sent: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    backgroundColor: C.ink,
    padding: 12,
    borderRadius: 14,
    borderBottomRightRadius: 3,
  },
  sentText: { fontSize: 12, color: C.white, lineHeight: 18 },
  messageInput: {
    borderTopWidth: 1,
    borderColor: C.line,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    backgroundColor: C.paper,
    borderRadius: 20,
    fontSize: 12,
    color: C.ink,
  },
  send: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { fontSize: 20, fontWeight: '800', color: C.ink },
  demoNote: { fontSize: 10, color: C.muted, textAlign: 'center', marginBottom: 12 },
  profileCard: {
    alignItems: 'center',
    backgroundColor: C.white,
    margin: 22,
    padding: 23,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
  },
  profileAvatar: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: C.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: { fontSize: 25, fontWeight: '900', color: C.ink },
  profileName: { fontSize: 19, fontWeight: '900', color: C.ink, marginTop: 10 },
  verified: {
    backgroundColor: '#EEF6E4',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 15,
    marginTop: 12,
  },
  verifiedText: { fontSize: 10, fontWeight: '800', color: '#5F8830' },
  serviceRow: {
    marginHorizontal: 22,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: C.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  serviceIcon: { fontSize: 22, color: C.ink, width: 28, textAlign: 'center' },
});
