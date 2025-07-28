"use client";

import { useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { ExtraGroup, ExtraItem } from "@/types/menu";
import { arrayMove } from "@dnd-kit/sortable";

type UseExtrasManagerOptions = {
  onSave?: () => void;
  onUpdate?: () => void;
  onReorder?: () => void;
  onDelete?: () => void;
};

const supabase = createClientComponentClient();

export function useExtrasManager(options: UseExtrasManagerOptions = {}) {
  const { onSave, onUpdate, onReorder, onDelete } = options;

  const [extraGroups, setExtraGroups] = useState<ExtraGroup[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadRestaurantId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("restaurants").select("id").eq("user_id", user.id).single();
    setRestaurantId(data?.id ?? null);
  }, []);

  const loadExtras = useCallback(async () => {
    if (!restaurantId) return;
    setIsLoading(true);

    const { data: groupsData } = await supabase
      .from("extra_groups")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("sort_order", { ascending: true });

    if (!groupsData) return;

    const groupsWithItems: ExtraGroup[] = [];

    for (const group of groupsData) {
      const { data: items } = await supabase
        .from("extras")
        .select("*")
        .eq("extra_group_id", group.id)
        .order("sort_order", { ascending: true });

      const formattedItems: ExtraItem[] = (items ?? []).map((item) => ({
        id: item.id,
        groupId: item.extra_group_id,
        name: item.name,
        price: item.price,
        stock: item.stock,
        image: item.image,
        isActive: item.is_active,
        sortOrder: item.sort_order,
      }));

      groupsWithItems.push({
        id: String(group.id),
        restaurantId,
        name: group.name,
        description: group.description,
        ruleType: group.rule_type,
        isRequired: group.is_required,
        isVisible: group.is_visible,
        maxSelections: group.max_selections,
        minSelections: group.min_selections,
        isIncluded: group.is_included,
        sortOrder: group.sort_order,
        items: formattedItems,
      });
    }

    setExtraGroups(groupsWithItems);
    setIsLoading(false);
  }, [restaurantId]);

  useEffect(() => {
    loadRestaurantId();
  }, [loadRestaurantId]);

  useEffect(() => {
    loadExtras();
  }, [loadExtras]);

  const handleSaveGroup = async (group: ExtraGroup) => {
    if (!restaurantId) return;
    const isNew = typeof group.id === "string" && group.id.startsWith("grp-");

    const groupData = {
      name: group.name,
      description: group.description,
      rule_type: group.ruleType,
      is_required: group.isRequired,
      is_visible: group.isVisible,
      max_selections: group.maxSelections,
      min_selections: group.minSelections,
      is_included: group.isIncluded,
      restaurant_id: restaurantId,
      sort_order: group.sortOrder ?? extraGroups.length,
    };

    if (isNew) {
      const { data } = await supabase.from("extra_groups").insert(groupData).select().single();
      if (data) {
        setExtraGroups((prev) => [
          ...prev,
          { ...group, id: String(data.id), sortOrder: data.sort_order, items: [] },
        ]);
        onSave?.();
      }
    } else {
      const { data: updated, error } = await supabase
        .from("extra_groups")
        .update(groupData)
        .eq("id", group.id)
        .select()
        .single();

      if (error) {
        console.error("❌ Error al actualizar grupo:", error.message);
        return;
      }

      if (updated) {
        setExtraGroups((prev) =>
          prev.map((g) =>
            g.id === group.id
              ? {
                  ...g,
                  name: updated.name,
                  description: updated.description,
                  ruleType: updated.rule_type,
                  isRequired: updated.is_required,
                  isVisible: updated.is_visible,
                  isIncluded: updated.is_included,
                  maxSelections: updated.max_selections,
                  minSelections: updated.min_selections,
                  sortOrder: updated.sort_order,
                }
              : g
          )
        );
      }
    }
  };

  const handleDeleteGroup = async (groupId: string | number) => {
    await supabase.from("extras").delete().eq("extra_group_id", groupId);
    await supabase.from("extra_groups").delete().eq("id", groupId);
    setExtraGroups((prev) => prev.filter((g) => g.id !== groupId));
    onDelete?.();
  };

  const handleSaveItem = async (groupId: string | number, newItem: ExtraItem) => {
    const group = extraGroups.find((g) => g.id === groupId);
    if (!group) return;

    const { data } = await supabase
      .from("extras")
      .insert({
        name: newItem.name,
        price: newItem.price,
        stock: newItem.stock,
        image: newItem.image,
        is_active: newItem.isActive,
        extra_group_id: groupId,
        sort_order: group.items.length,
      })
      .select()
      .single();

    if (data) {
      const savedItem: ExtraItem = { ...newItem, id: String(data.id), sortOrder: data.sort_order };
      setExtraGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, items: [...g.items, savedItem] } : g))
      );
    }
  };

  const handleUpdateItem = async (groupId: string | number, item: ExtraItem) => {
    const group = extraGroups.find((g) => g.id === groupId);
    if (!group) return;

    if (typeof item.id === "string" && item.id.startsWith("item-")) {
      return handleSaveItem(groupId, item);
    } else {
      await supabase
        .from("extras")
        .update({
          name: item.name,
          price: item.price,
          stock: item.stock,
          image: item.image,
          is_active: item.isActive,
        })
        .eq("id", item.id);

      setExtraGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, items: g.items.map((i) => (i.id === item.id ? item : i)) }
            : g
        )
      );
    }
  };

  const handleDeleteItem = async (groupId: string | number, itemId: string) => {
    await supabase.from("extras").delete().eq("id", itemId);
    setExtraGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, items: g.items.filter((i) => i.id !== itemId) } : g
      )
    );
  };

  const handleReorderItems = async (groupId: string, newItems: ExtraItem[]) => {
    setExtraGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, items: newItems } : g
      )
    );

    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i];
      await supabase.from("extras").update({ sort_order: i }).eq("id", item.id);
    }

    onReorder?.();
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = extraGroups.findIndex((g) => g.id === active.id);
    const newIndex = extraGroups.findIndex((g) => g.id === over.id);
    const newOrder = arrayMove(extraGroups, oldIndex, newIndex);
    setExtraGroups(newOrder);

    for (let i = 0; i < newOrder.length; i++) {
      await supabase.from("extra_groups").update({ sort_order: i }).eq("id", newOrder[i].id);
    }

    onReorder?.();
  };

  return {
    extraGroups,
    setExtraGroups,
    restaurantId,
    isLoading,
    handleSaveGroup,
    handleDeleteGroup,
    handleSaveItem,
    handleUpdateItem,
    handleDeleteItem,
    handleReorderItems,
    handleDragEnd,
  };
}
