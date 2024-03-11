// LIBS
import { useEffect, useRef, useState } from "react"
import { Alert, Keyboard, Text, View } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import Bottom from "@gorhom/bottom-sheet"
import dayjs from "dayjs"

// COMPONENTS
import { Input } from "@/components/Input"
import { Header } from "@/components/Header"
import { Button } from "@/components/Button"
import { Loading } from "@/components/Loading"
import { Progress } from "@/components/Progress"
import { BackButton } from "@/components/BackButton"
import { BottomSheet } from "@/components/BottomSheet"
import { Transactions } from "@/components/Transactions"
import { TransactionProps } from "@/components/Transaction"
import { TransactionTypeSelect } from "@/components/TransactionTypeSelect"

// UTILS
import { mocks } from "@/utils/mocks"
import { currencyFormat } from "@/utils/currencyFormat"

// DATABASE
import { useGoalsRepository } from "@/database/useGoalsRepository"
import { useTransactionsRepository } from "@/database/useTransationsRepository"
import { DeleteButton } from "@/components/DeleteButton"

type Details = {
  name: string
  total: string
  current: string
  percentage: number
  transactions: TransactionProps[]
}

export default function Details() {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [type, setType] = useState<"up" | "down">("up")
  const [goal, setGoal] = useState<Details>({} as Details)
  const [totalDeposit, setTotalDeposit] = useState<number>(0);
  const [totalWithdraw, setTotalWithdraw] = useState<number>(0);

  // PARAMS
  const routeParams = useLocalSearchParams()
  const goalId = Number(routeParams.id)

  // BOTTOM SHEET
  const bottomSheetRef = useRef<Bottom>(null)
  const handleBottomSheetOpen = () => bottomSheetRef.current?.expand()
  const handleBottomSheetClose = () =>  {
    bottomSheetRef.current?.snapToIndex(0);
    Keyboard.dismiss();
  }

  // DATABASE
  const useGoal = useGoalsRepository();
  const useTransaction = useTransactionsRepository();

  function fetchDetails() {
    try {
      if (goalId) {
        const goal = useGoal.show(goalId);
        const transactions = useTransaction.findByGoal(goalId);

        if (!goal || !transactions) {
          return router.back()
        }

        setGoal({
          name: goal.name,
          current: currencyFormat(goal.current),
          total: currencyFormat(goal.total),
          percentage: (goal.current / goal.total) * 100,
          transactions: transactions.map((item) => ({
            ...item,
            date: dayjs(item.created_at).format("DD/MM/YYYY [às] HH:mm"),
            onDelete: () => {
              handleDeleteTransaction(item.id);
            }
          })),
        })

        setTotalDeposit(transactions.filter((transaction) => transaction.amount > 0).reduce((a, b) => a + b.amount, 0));
        setTotalWithdraw(transactions.filter((transaction) => transaction.amount < 0).reduce((a, b) => a + (b.amount * -1), 0));

        setIsLoading(false)
      }
    } catch (error) {
      console.log(error)
    }
  }

  async function handleNewTransaction() {
    try {
      let amountAsNumber = Number(amount.replace(",", "."))

      if (isNaN(amountAsNumber)) {
        return Alert.alert("Erro", "Valor inválido.")
      }

      if (type === "down") {
        if (goal.percentage === 0) {
          return Alert.alert("Erro", "Não há valor inserido nessa meta");
        }
        amountAsNumber = amountAsNumber * -1
      } else {
        if (goal.percentage >= 100) {
          return Alert.alert("Erro", "Essa meta já foi batida!");
        }
      }

      useTransaction.create({ goalId, amount: amountAsNumber });
      fetchDetails();

      Alert.alert("Sucesso", "Transação registrada!")

      handleBottomSheetClose()
      Keyboard.dismiss()

      setAmount("")
      setType("up")
    } catch (error) {
      console.log(error)
    }
  }

  function handleDeleteGoal() {
    try {
      useGoal.remove(goalId);
      Keyboard.dismiss();
      return router.back();
    } catch (error) {
      console.log(error);
    }
  }

  function handleDeleteTransaction(id: number) {
    try {
      useTransaction.remove(id);
      fetchDetails();
    } catch (error) {
      throw error;
    }
  }

  useEffect(() => {
    fetchDetails()
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <View className="flex-1 p-8 pt-12 my-12">
      <View className="flex flex-row gap-4 items-center mb-12">
        <BackButton />

        <Header title={goal.name} subtitle={`${goal.current} de ${goal.total}`} />

        <DeleteButton onPress={handleDeleteGoal}/>
      </View>

      <Progress percentage={goal.percentage} />

      <View className="flex flex-row gap-2 justify-center mt-8">
        <View className={`flex flex-row items-center justify-center border-1 flex-1 bg-green-300/30 rounded-md border-green-300 py-8`}>
          <Text className="text-green-300 text-xl z-10">
            {
              Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalDeposit)
            }
          </Text>
        </View>
        <View className={`flex flex-row items-center justify-center border-1 flex-1 bg-red-300/30 rounded-md border-red-300 py-12`}>
          <Text className="text-red-300 text-xl">
            {
              Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalWithdraw)
            }
          </Text>
        </View>
      </View>
      <View className="flex-1 mt-10 mb-10">
        <Transactions title="Transações" transactions={goal.transactions} total={goal.transactions.length} />
      </View>
      <View className="w-full flex flex-col">
        <Button title="Nova transação" onPress={handleBottomSheetOpen} />
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        title="Nova transação"
        snapPoints={[0.01, 284]}
        onClose={handleBottomSheetClose}
      >
        <TransactionTypeSelect onChange={setType} selected={type} />

        <Input
          placeholder="Valor"
          keyboardType="numeric"
          onChangeText={setAmount}
          value={amount}
        />

        <Button title="Confirmar" onPress={handleNewTransaction} />
      </BottomSheet>
    </View>
  )
}
