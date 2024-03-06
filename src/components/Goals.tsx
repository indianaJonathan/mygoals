import { ScrollView, TouchableOpacity, View } from "react-native"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"

import { Goal } from "@/components/Goal"
import { colors } from "@/styles/colors"

export type GoalsProps = {
  id: string
  name: string
  current: number
  total: number
}[]

type Props = {
  goals: GoalsProps
  onPress: (id: string) => void
  onAdd: () => void
}

export function Goals({ goals, onAdd, onPress }: Props) {
  return (
    <View className="flex flex-row gap-4">
      <TouchableOpacity
        activeOpacity={0.7}
        className={`bg-green-500 ${goals.length > 0 ? 'w-16' : 'w-full'} h-44 items-center justify-center rounded-lg`}
        onPress={onAdd}
      >
        <MaterialIcons name="add" size={36} color={colors.black} />
      </TouchableOpacity>
      <ScrollView
        horizontal
        contentContainerClassName="gap-4"
        showsHorizontalScrollIndicator={false}
        className="w-full max-h-44"
      >
        {goals.map(({ id, name, current, total }) => (
          <Goal
            key={id}
            goal={{ id, name, current, total }}
            onPress={() => onPress(id)}
          />
        ))}
      </ScrollView>
    </View>
  )
}
