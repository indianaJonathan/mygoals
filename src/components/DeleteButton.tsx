import { MaterialIcons } from "@expo/vector-icons";
import {  TouchableOpacity, TouchableOpacityProps } from "react-native"

type DeleteButtonProps = {
    size?: number;
}

export function DeleteButton({ size = 36, ...rest }: DeleteButtonProps & TouchableOpacityProps){
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            className="items-center justify-center rounded-sm"
            {...rest}
        >
            <MaterialIcons name="delete-outline" size={size} color="red" className="text-red-500"/>
        </TouchableOpacity>
    );
}