import { DisconnectReason, MobEquipmentPacket } from "@serenityjs/protocol";
import { NetworkSession } from "@serenityjs/network";
import { Item } from "@serenityjs/world";

import { SerenityHandler } from "./serenity-handler";

class MobEquipment extends SerenityHandler {
	public static readonly packet = MobEquipmentPacket.id;

	public static handle(
		packet: MobEquipmentPacket,
		session: NetworkSession
	): void {
		// Get the player from the session
		// If there is no player, then disconnect the session.
		const player = this.serenity.getPlayer(session);
		if (!player)
			return session.disconnect(
				"Failed to connect due to an invalid player. Please try again.",
				DisconnectReason.InvalidPlayer
			);

		// Get the players inventory component
		const inventory = player.getComponent("minecraft:inventory");

		// Get the selected item from the inventory
		const item = inventory.container.getItem(packet.selectedSlot);

		// Set the players selected slot for the inventory
		inventory.selectedSlot = packet.selectedSlot;

		// Check if the items are not the same.
		// If so, disconnect the player.
		if (item && item.type.network !== packet.item.network) {
			session.disconnect(
				"Inventory out of sync, mismatch item runtimeid.",
				DisconnectReason.BadPacket
			);
			return this.serenity.logger.warn(
				`Player ${player.username} has been disconnected due to inventory out of sync, mismatch item runtimeid.`
			);
		} else if (item && item.amount !== packet.item.stackSize) {
			session.disconnect(
				"Inventory out of sync, mismatch item count.",
				DisconnectReason.BadPacket
			);
			return this.serenity.logger.warn(
				`Player ${player.username} has been disconnected due to inventory out of sync, mismatch item count.`
			);
		}

		// Create a new MobEquipmentPacket
		const mobEquipment = new MobEquipmentPacket();

		// Set the packet data
		mobEquipment.runtimeEntityId = player.runtime;
		mobEquipment.item = item === null ? { network: 0 } : Item.toItemStack(item);
		mobEquipment.slot = packet.slot;
		mobEquipment.selectedSlot = packet.selectedSlot;
		mobEquipment.containerId = packet.containerId;

		// Broadcast the packet to the dimension
		player.dimension.broadcastExcept(player, mobEquipment);
	}
}

export { MobEquipment };
