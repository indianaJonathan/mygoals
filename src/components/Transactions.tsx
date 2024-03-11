import { Text, View } from "react-native"

import { Transaction, TransactionProps } from "@/components/Transaction"
import { ScrollView } from "react-native-gesture-handler";

export type TransactionsProps = TransactionProps[]

type Props = {
  title: string;
  total?: number;
  transactions: TransactionsProps | undefined;
}

export function Transactions({ title, total = 0, transactions }: Props) {
  return (
    <View className="flex flex-col gap-2">
      <View className="flex flex-row justify-between">
        <Text className="text-white font-semiBold text-base border-b border-b-gray-400 pb-3">
          {title}
        </Text>
        { total > 0 &&
          <Text className="text-zinc-100 font-semibold text-base">
            ({total})
          </Text>
        }
      </View>
      <ScrollView>
        { transactions && transactions.length > 0 && transactions.map((t) => (
            <Transaction transaction={t} key={t.id}/>
        )) }
        { !transactions || transactions.length === 0 && 
          <Text className="text-gray-300 font-regular text-sm">
            Nenhuma transação registrada ainda.
          </Text>
        }
      </ScrollView>
    </View>
  )
}
