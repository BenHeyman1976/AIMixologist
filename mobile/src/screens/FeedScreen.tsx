import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Pressable,
} from "react-native";
import type { Cocktail } from "../types";
import { colors } from "../theme";
import FeedItem from "../components/FeedItem";
import RecipeSheet from "../components/RecipeSheet";
import CommentsSheet from "../components/CommentsSheet";
import {
  getComments,
  getFeed,
  toggleVote,
  type FeedSort as Sort,
} from "../api/client";

const SORTS: { key: Sort; label: string }[] = [
  { key: "trending", label: "Trending" },
  { key: "newest", label: "Newest" },
  { key: "most_voted", label: "Top" },
];

// Full-screen, vertically-swipeable feed — the TikTok-style discovery surface.
export default function FeedScreen() {
  const { height } = useWindowDimensions();
  const [sort, setSort] = useState<Sort>("trending");
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [recipeFor, setRecipeFor] = useState<Cocktail | null>(null);
  const [commentsFor, setCommentsFor] = useState<Cocktail | null>(null);
  // Bump to refresh comment counts after adding one.
  const [tick, setTick] = useState(0);

  const load = useCallback(async (s: Sort) => {
    setCocktails(await getFeed(s));
  }, []);

  useEffect(() => {
    load(sort);
  }, [sort, load]);

  function like(c: Cocktail) {
    const { voted, vote_count } = toggleVote(c.id);
    setCocktails((prev) =>
      prev.map((x) => (x.id === c.id ? { ...x, voted, vote_count } : x))
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cocktails}
        keyExtractor={(c) => c.id}
        extraData={tick}
        pagingEnabled
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
        renderItem={({ item }) => (
          <FeedItem
            cocktail={item}
            height={height}
            commentCount={getComments(item.id).length}
            onLike={() => like(item)}
            onOpenRecipe={() => setRecipeFor(item)}
            onOpenComments={() => setCommentsFor(item)}
          />
        )}
      />

      {/* Floating sort header */}
      <View style={styles.header} pointerEvents="box-none">
        <Text style={styles.logo}>🍹 Bob</Text>
        <View style={styles.sorts}>
          {SORTS.map((s) => (
            <Pressable key={s.key} onPress={() => setSort(s.key)}>
              <Text style={[styles.sort, sort === s.key && styles.sortActive]}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <RecipeSheet
        cocktail={recipeFor}
        visible={!!recipeFor}
        onClose={() => setRecipeFor(null)}
      />
      <CommentsSheet
        cocktailId={commentsFor?.id ?? null}
        visible={!!commentsFor}
        onClose={() => setCommentsFor(null)}
        onAdded={() => setTick((t) => t + 1)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ink },
  header: {
    position: "absolute",
    top: 54,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  logo: { color: colors.white, fontSize: 20, fontWeight: "900" },
  sorts: { flexDirection: "row", gap: 16 },
  sort: { color: "rgba(255,255,255,0.6)", fontSize: 15, fontWeight: "700" },
  sortActive: {
    color: colors.white,
    textDecorationLine: "underline",
    textDecorationColor: colors.coral,
  },
});
