// LIBS
import { useEffect, useRef, useState } from "react"
import { Alert, View, Keyboard, Text } from "react-native"
import Bottom from "@gorhom/bottom-sheet"
import { router } from "expo-router"
import dayjs from "dayjs"

// COMPONENTS
import { Input } from "@/components/Input"
import { Header } from "@/components/Header"
import { Button } from "@/components/Button"
import { BottomSheet } from "@/components/BottomSheet"
import { Goals, GoalsProps } from "@/components/Goals"
import { Transactions, TransactionsProps } from "@/components/Transactions"

// UTILS
import { MaterialIcons } from "@expo/vector-icons"

// DATABASE 
import { useGoalsRepository } from "@/database/useGoalsRepository"
import { useTransactionsRepository } from "@/database/useTransationsRepository"
import { colors } from "@/styles/colors"
import { ScrollView } from "react-native-gesture-handler"
import { TransactionProps } from "@/components/Transaction"

export default function Home() {
  // LISTS
  const [transactions, setTransactions] = useState<TransactionsProps>([])
  const [goals, setGoals] = useState<GoalsProps>([])

  // FORM
  const [name, setName] = useState("")
  const [total, setTotal] = useState("")

  // DATABASE
  const useGoal = useGoalsRepository();
  const useTransaction = useTransactionsRepository();

  // BOTTOM SHEET
  const bottomSheetRef = useRef<Bottom>(null)
  const handleBottomSheetOpen = () => bottomSheetRef.current?.expand()
  const handleBottomSheetClose = () =>  {
    bottomSheetRef.current?.snapToIndex(0);
    Keyboard.dismiss();
  }

  function handleDetails(id: number) {
    router.navigate("/details/" + id)
  }

  async function handleCreate() {
    try {
      const totalAsNumber = Number(total.toString().replace(",", "."))

      if (isNaN(totalAsNumber)) {
        return Alert.alert("Erro", "Valor inválido.")
      }

      useGoal.create({ name, total: totalAsNumber });
      fetchGoals();
      fetchTransactions();

      Keyboard.dismiss()
      handleBottomSheetClose()
      Alert.alert("Sucesso", "Meta cadastrada!", undefined, {
        userInterfaceStyle: "dark"
      })

      setName("")
      setTotal("")
    } catch (error) {
      Alert.alert("Erro", "Não foi possível cadastrar." + error, undefined, {
        userInterfaceStyle: "dark"
      })
      console.log(error)
    }
  }

  async function fetchGoals() {
    try {
      const response = useGoal.all().map((g) => {
        return {
          ...g,
          id: Number.parseInt(g.id),
        }
      });
      setGoals(response);
    } catch (error) {
      console.log(error)
    }
  }

  async function fetchTransactions() {
    try {
      const response = useTransaction.findLatest();

      setTransactions(
        response.map((item) => ({
          ...item,
          date: dayjs(item.created_at).format("DD/MM/YYYY [às] HH:mm"),
          onDelete: () => {
            handleDeleteTransaction(item.id);
          }
        }))
      )
    } catch (error) {
      console.log(error)
    }
  }

  function fetchGoalTransactions(goalId: number) {
    try {
      const response = useTransaction.findByGoal(goalId) ?? [];

      return response.map((t) => ({
        ...t,
        date: dayjs(t.created_at).format("DD/MM/YYYY [às] HH:mm"),
        onDelete: () => {
          handleDeleteTransaction(t.id);
        }
      }));
    } catch (error) {
      console.log(error);
    }
  }

  function handleDeleteTransaction(id: number) {
    try {
      useTransaction.remove(id);
      fetchGoals();
      fetchTransactions();
    } catch (error) {
      throw error;
    }
  }

  useEffect(() => {
    fetchGoals()
    fetchTransactions()
  }, [])

  return (
    <View className="flex-1 p-8">
      <View className="flex flex-row py-20">
        <Header
          title="Suas metas"
          subtitle="Poupe hoje para colher os frutos amanhã."
        />
      </View>

      <Goals
        goals={goals}
        onAdd={handleBottomSheetOpen}
        onPress={handleDetails}
      />

      <ScrollView
        className="flex flex-col flex-1 mt-10"
        contentContainerStyle={{
          justifyContent: "flex-start"
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex flex-col items-center justify-center py-8">
          <Text className="text-xl text-white bg-zinc-700 p-4 rounded-md">Transações recentes</Text>
        </View>
        { goals.length > 0 ? 
          <View className="flex flex-col gap-4">
            { goals.map((goal) => {
              const goalTransactions: TransactionProps[] = fetchGoalTransactions(goal.id) ?? [];
              const lastTransaction = goalTransactions[0];
              return (
                <Transactions key={goal.id} title={goal.name} total={goalTransactions.length} transactions= {goalTransactions.length > 0 ? [lastTransaction] : []} />
              );
            })}
          </View>
        :
          <View className="flex flex-col p-12 flex-1 items-center gap-12">
            <MaterialIcons name="arrow-circle-up" size={72} color={colors.green[700]}/>
            <Text className="text-zinc-400 text-xl">
              Você ainda não tem nenhuma meta criada. Comece clicando no botão verde acima
            </Text>
          </View> }
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        title="Nova meta"
        snapPoints={[50, 284]}
        onClose={handleBottomSheetClose}
      >
        <MaterialIcons name="push-pin" size={20}/>

        <Input placeholder="Nome da meta" onChangeText={setName} value={name} />

        <Input
          placeholder="Valor"
          keyboardType="numeric"
          onChangeText={setTotal}
          value={total}
        />

        <Button title="Criar" onPress={handleCreate} />
      </BottomSheet>
    </View>
  )
}
