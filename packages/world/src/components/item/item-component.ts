import { type ItemIdentifier, type Items, ItemType } from "@serenityjs/item";

import { Component } from "../component";

import type { ItemUseCause } from "../../enums";
import type { Player } from "../../player";
import type { ItemStack } from "../../item";

class ItemComponent<T extends keyof Items> extends Component {
	/**
	 * A collective registry of all item components registered to an item.
	 */
	public static readonly registry = new Map<
		ItemIdentifier,
		Array<typeof ItemComponent>
	>();

	/**
	 * A collective registry of all item components.
	 */
	public static readonly components = new Map<string, typeof ItemComponent>();

	/**
	 * The item the component is binded to.
	 */
	public static readonly types: Array<ItemIdentifier> = [];

	/**
	 * The item the component is binded to.
	 */
	protected readonly item: ItemStack<T>;

	/**
	 * Creates a new item component.
	 *
	 * @param item The item the component is binded to.
	 * @param identifier The identifier of the component.
	 * @returns A new item component.
	 */
	public constructor(item: ItemStack<T>, identifier: string) {
		super(identifier);
		this.item = item;

		// Register the component to the item.
		this.item.components.set(this.identifier, this);
	}

	/**
	 * Registers the item component to the item type.
	 * @param type The item type to register the component to.
	 */
	public static register<T extends keyof Items>(type: ItemType<T>): void {
		// Get the components of the item type.
		const components = this.registry.get(type.identifier) ?? [];

		// Push the component to the components.
		components.push(this);

		// Register the components to the item type.
		this.registry.set(type.identifier, components);
	}

	/**
	 * Clones the item component.
	 * @param item The item stack to clone the component to.
	 * @returns A new item component.
	 */
	public clone(item: ItemStack<T>): this {
		// Create a new instance of the component.
		const component = new (this.constructor as new (
			item: ItemStack<T>,
			identifier: string
		) => ItemComponent<T>)(item, this.identifier) as this;

		// Copy the key-value pairs.
		for (const [key, value] of Object.entries(this)) {
			// Skip the item.
			if (key === "item") continue;

			// @ts-expect-error
			component[key] = value;
		}

		// Return the component.
		return component;
	}

	/**
	 * Called when the item has started to be used.
	 * @param player The player that started to use the item.
	 * @param cause The cause of the item use. (e.g. right-click, left-click)
	 */
	public onStartUse?(player: Player, cause: ItemUseCause): void;

	/**
	 * Called when the item has stopped being used.
	 * @param player The player that stopped using the item.
	 * @param cause The cause of the item use. (e.g. right-click, left-click)
	 */
	public onStopUse?(player: Player, cause: ItemUseCause): void;

	/**
	 * Called when the item has been used.
	 * @param player The player that used the item.
	 * @param cause The cause of the item use. (e.g. right-click, left-click)
	 * @returns If the item was successfully used, this will cause the event to be done using the item.
	 */
	public onUse?(player: Player, cause: ItemUseCause): boolean;

	public static bind(): void {
		// Bind the component to the item types.
		for (const identifier of this.types) {
			// Get the item type.
			const type = ItemType.get(identifier);

			// Register the component to the item type.
			if (type) this.register(type);
		}

		// Register the component.
		ItemComponent.components.set(this.identifier, this);
	}
}

export { ItemComponent };
