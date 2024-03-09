import { Pressable, PressableProps, Text } from "react-native"

import { currencyFormat } from "@/utils/currencyFormat"
import { colors } from "@/styles/colors"
import { DeleteButton } from "./DeleteButton"

export type TransactionProps = {
  id: number
  date: string
  amount: number
  goal_id: number
  onDelete: (id: number) => void;
}

type Props = PressableProps & {
  transaction: TransactionProps
}

export function Transaction({ transaction, ...rest }: Props) {
  return (
    <Pressable
      className="w-full h-16 bg-gray-500 rounded-sm border border-gray-400 p-4 flex-row items-center justify-between"
      {...rest}
    >
      <Text
        className="font-regular text-sm"
        style={{
          color: transaction.amount < 0 ? colors.red[500] : colors.green[500],
        }}
      >
        {transaction.amount < 0 ? "- " : "+ "}
        {currencyFormat(transaction.amount).replace("-", "")}
      </Text>

      <Text className="text-gray-300 font-regular text-sm">
        {transaction.date}
      </Text>

      <DeleteButton size={20} onPress={() => { transaction.onDelete(transaction.id) }}/>
    </Pressable>
  )
}
