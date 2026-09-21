import React from 'react';
import { ActionCard, type ActionCardProps } from './ActionCard';

export type TaskCardProps = ActionCardProps;

export const TaskCard: React.FC<TaskCardProps> = (props) => {
  return <ActionCard {...props} />;
};
